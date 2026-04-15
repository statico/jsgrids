import { readdirSync, readFileSync } from "fs";
import { basename, join } from "path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { Features } from "./features";
import fetcher from "./fetcher";

//
// Yes, these types and things seem pretty overcomplicated, but it sure makes
// importing data and working with TypeScript a lot easier.
//

const URL = z.string().url("Must be a valid URL");

const GitHubRepo = z.string().refine((str: string) => /^\S+\/\S+$/.test(str), {
  message: "Must be a username/repo pair",
});

const Feature = z.union([z.boolean(), URL, z.string()], {
  message:
    "Must be a valid URL, boolean, or string (which will show a warming)",
});

const FrameworkValue = z
  .union([URL, z.boolean()], {
    message: "Must be a valid URL or boolean",
  })
  .optional();

const Frameworks = z.object({
  vanilla: FrameworkValue,
  react: FrameworkValue,
  vue: FrameworkValue,
  svelte: FrameworkValue,
  angular: FrameworkValue,
  solid: FrameworkValue,
  qwik: FrameworkValue,
  lit: FrameworkValue,
  jquery: FrameworkValue,
  ember: FrameworkValue,
});

export type FrameworkName = keyof z.infer<typeof Frameworks>;

// Validate and type the data we get from the YAML files in `data`.
const ImportedYAMLInfo = z.object({
  title: z.string(),
  description: z.string(),
  homeUrl: z.union([URL, z.null()]),
  demoUrl: z.union([URL, z.null()]),
  githubRepo: z.union([GitHubRepo, z.null()]),
  npmPackage: z.union([z.string(), z.null()]),
  license: z.union([z.string(), z.null()]),
  revenueModel: z.union([z.string(), z.null()]),
  frameworks: Frameworks,
  features: z.record(z.string(), Feature),
});

// Allow additional information to be added to the library info dictionaries.
const AugmentedInfo = z.object({
  ...ImportedYAMLInfo.shape,
  id: z.string(),
  github: z
    .object({
      url: URL,
      stars: z.number(),
      forks: z.number(),
      openIssues: z.number(),
      watchers: z.number(),
      subscribers: z.number(),
      network: z.number(),
      contributors: z.number(),
    })
    .optional(),
  npm: z
    .object({
      url: URL,
      downloads: z.number(),
    })
    .optional(),
  packagephobia: z
    .union([
      z.object({
        url: URL,
        publishSize: z.number(),
        installSize: z.number(),
      }),
      z.null(),
    ])
    .optional(),
  npms: z
    .object({
      quality: z.number(),
      maintenance: z.number(),
      dependencies: z.number(),
      qualityUrl: URL,
      dependenciesUrl: URL,
    })
    .optional(),
});

// Make the final thing we return read-only.
const LibraryInfo = AugmentedInfo.readonly();

type ImportedYAMLInfo = z.infer<typeof ImportedYAMLInfo>;
type AugmentedInfo = z.infer<typeof AugmentedInfo>;
export type LibraryInfo = z.infer<typeof LibraryInfo>;

const allowedFeatures = new Set(Object.keys(Features));

// Deduplicate concurrent calls (/ and /list pages generate simultaneously during build)
let _librariesPromise: Promise<LibraryInfo[]> | null = null;

export const getLibraries = async (): Promise<LibraryInfo[]> => {
  if (!_librariesPromise) {
    _librariesPromise = _getLibrariesImpl().catch((err) => {
      _librariesPromise = null;
      throw err;
    });
  }
  return _librariesPromise;
};

const _getLibrariesImpl = async (): Promise<LibraryInfo[]> => {
  // Get paths to all YAML files.
  const dataDir = join(process.cwd(), "data");
  const paths = readdirSync(dataDir)
    .filter((name) => /\.yml$/.test(name))
    .map((name) => join(dataDir, name));

  // Parse all YAML files upfront to collect npm package names for bulk fetch.
  const parsed: { path: string; id: string; item: AugmentedInfo }[] = [];
  for (const path of paths) {
    const id = basename(path, ".yml");
    const obj = parseYaml(readFileSync(path, "utf8"));
    if (typeof obj !== "object") {
      throw new Error(`Expected ${path} to be an object`);
    }

    let item: AugmentedInfo;
    try {
      const importedData = ImportedYAMLInfo.parse(obj);
      item = AugmentedInfo.parse({ id, ...importedData });
    } catch (err: any) {
      const validationError = fromZodError(err);
      throw new Error(`${path} didn't validate: ${validationError}`);
    }

    for (const key in item.features) {
      if (!allowedFeatures.has(key)) {
        throw new Error(`In ${path}, unexpected feature "${key}"`);
      }
    }

    parsed.push({ path, id, item });
  }

  // Batch-fetch NPM download counts using the bulk API endpoint.
  // The bulk endpoint doesn't support scoped packages (@scope/pkg), so we
  // batch unscoped packages (1 request for ~44 packages) and fetch scoped
  // packages individually in parallel via Promise.all.
  const npmPackageNames = [
    ...new Set(
      parsed
        .map((p) => p.item.npmPackage)
        .filter((name): name is string => name != null),
    ),
  ];
  const unscopedPackages = npmPackageNames.filter((n) => !n.startsWith("@"));
  const scopedPackages = npmPackageNames.filter((n) => n.startsWith("@"));
  const npmDownloads = new Map<string, number>();

  // Fetch unscoped packages in bulk (1-2 requests instead of ~44 individual)
  if (unscopedPackages.length > 0) {
    const chunkSize = 50;
    for (let i = 0; i < unscopedPackages.length; i += chunkSize) {
      const chunk = unscopedPackages.slice(i, i + chunkSize);
      try {
        const { data } = await fetcher(
          `https://api.npmjs.org/downloads/point/last-week/${chunk.join(",")}`,
        );
        if (chunk.length === 1) {
          npmDownloads.set(chunk[0], data.downloads ?? 0);
        } else {
          for (const name of chunk) {
            const entry = data[name];
            if (entry && typeof entry.downloads === "number") {
              npmDownloads.set(name, entry.downloads);
            }
          }
        }
      } catch (err: any) {
        console.log(
          "libraries: bulk npm fetch failed for chunk %d: %s",
          i / chunkSize,
          err.message,
        );
      }
    }
  }

  // Fetch scoped packages individually in parallel
  if (scopedPackages.length > 0) {
    const scopedResults = await Promise.allSettled(
      scopedPackages.map(async (name) => {
        const { data } = await fetcher(
          `https://api.npmjs.org/downloads/point/last-week/${name}`,
        );
        npmDownloads.set(name, data.downloads ?? 0);
      }),
    );
    for (let i = 0; i < scopedResults.length; i++) {
      if (scopedResults[i].status === "rejected") {
        console.log(
          "libraries: npm fetch failed for %s: %s",
          scopedPackages[i],
          (scopedResults[i] as PromiseRejectedResult).reason?.message,
        );
      }
    }
    console.log(
      "libraries: bulk npm fetch got downloads for %d/%d packages",
      npmDownloads.size,
      npmPackageNames.length,
    );
  }

  const items: AugmentedInfo[] = [];
  const results = await Promise.allSettled(
    parsed.map(async ({ path, item }) => {
      // Run GitHub, Package Phobia, and npms.io in parallel.
      // NPM downloads are already pre-fetched via bulk API.
      const githubPromise = (async () => {
        if (!item.githubRepo) return;

        const { data: repo } = await fetcher(
          `https://api.github.com/repos/${item.githubRepo}`,
        );
        if (repo.error) {
          throw new Error(
            `GitHub repo ${item.githubRepo} error: ${repo.error}`,
          );
        }
        if (repo.full_name !== item.githubRepo) {
          throw new Error(
            `GitHub repo ${item.githubRepo} has moved to ${repo.full_name}`,
          );
        }

        const pageSize = 100;
        const url = `https://api.github.com/repos/${item.githubRepo}/contributors?per_page=${pageSize}`;
        const res1 = await fetcher(url);
        const data2: any = res1.data;
        let contributors;
        if (data2.length < pageSize || !res1.headers.link) {
          contributors = data2.length;
        } else {
          const link = res1.headers.link ?? "";
          const parts = link.split(",");
          const lastPart =
            parts.find((s: string) => /rel="last"/.test(s)) ?? "";
          const match = lastPart.match(/\bpage=(\d+)/);
          const lastPage = Number(match ? match[1] : 1);
          const res2 = await fetcher(`${url}&page=${lastPage}`);
          const data3: any = res2.data;
          const total = pageSize * (lastPage - 1) + data3.length;
          contributors = total;
        }

        item.github = {
          url: repo.html_url,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          openIssues: repo.open_issues_count,
          watchers: repo.watchers_count,
          subscribers: repo.subscribers_count,
          network: repo.network_count,
          contributors,
        };
      })();

      const packagephobiaPromise = (async () => {
        if (!item.npmPackage) return;
        const name = item.npmPackage;
        const url = `https://packagephobia.com/result?p=${name}`;
        try {
          const { data } = await fetcher(
            `https://packagephobia.com/v2/api.json?p=${name}`,
          );
          const publishSize =
            data.publish?.bytes ?? data.publishSize ?? data.size ?? 0;
          const installSize =
            data.install?.bytes ?? data.installSize ?? data.gzip ?? 0;
          item.packagephobia = { url, publishSize, installSize };
        } catch (err) {
          console.log("libraries: giving up getting package size for %s", name);
          item.packagephobia = { url, publishSize: -1, installSize: -1 };
        }
      })();

      const npmsPromise = (async () => {
        if (!item.npmPackage) return;
        const name = item.npmPackage;
        try {
          const { data } = await fetcher(
            `https://api.npms.io/v2/package/${encodeURIComponent(name)}`,
          );
          const qualityScore = data.score?.final ?? 0;
          const quality = Math.ceil(qualityScore * 100);
          const maintenanceScore = data.score?.detail?.maintenance ?? 0;
          const maintenance = Math.ceil(maintenanceScore * 100);
          const dependencies = data.collected?.metadata?.dependencies
            ? Object.keys(data.collected.metadata.dependencies).length
            : 0;
          item.npms = {
            quality,
            maintenance,
            dependencies,
            qualityUrl: "https://npms.io/about",
            dependenciesUrl: `https://www.npmjs.com/package/${name}?activeTab=dependencies`,
          };
        } catch (err) {
          console.log("libraries: giving up getting npms.io data for %s", name);
        }
      })();

      // Run all API calls concurrently
      await Promise.all([githubPromise, packagephobiaPromise, npmsPromise]);

      // Apply pre-fetched NPM download data
      if (item.npmPackage) {
        const downloads = npmDownloads.get(item.npmPackage);
        if (downloads !== undefined) {
          item.npm = {
            url: `https://www.npmjs.com/package/${item.npmPackage}`,
            downloads,
          };
        }
      }

      try {
        items.push(AugmentedInfo.parse(item));
      } catch (err: any) {
        const validationError = fromZodError(err);
        throw new Error(`AugmentedInfo for ${path}: ${validationError}`);
      }
    }),
  );

  // Log any libraries that failed to fetch
  const failures = results.filter(
    (r): r is PromiseRejectedResult => r.status === "rejected",
  );
  if (failures.length > 0) {
    console.log(
      "libraries: %d/%d libraries failed to fetch:",
      failures.length,
      paths.length,
    );
    for (const f of failures) {
      console.log("  - %s", f.reason?.message ?? f.reason);
    }
  }

  if (items.length === 0) {
    throw new Error("No libraries were fetched successfully");
  }

  return items;
};
