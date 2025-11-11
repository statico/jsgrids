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

// Get all the library data, fetching from APIs or using the cache as necessary.
export const getLibraries = async (): Promise<LibraryInfo[]> => {
  // Get paths to all YAML files.
  const dataDir = join(process.cwd(), "data");
  const paths = readdirSync(dataDir)
    .filter((name) => /\.yml$/.test(name))
    .map((name) => join(dataDir, name));

  const items: AugmentedInfo[] = [];
  await Promise.all(
    paths.map(async (path) => {
      const id = basename(path, ".yml");

      // Load raw YAML data and make sure it validates.
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

      // Populate GitHub data if the library has a GitHub repo.
      if (item.githubRepo) {
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
      }

      // Populate NPM data if the library has an NPM package name.
      if (item.npmPackage) {
        const name = item.npmPackage;
        const res = await fetcher(
          `https://api.npmjs.org/downloads/point/last-week/${name}`,
        );
        const data: any = res.data;
        const npm = {
          url: `https://www.npmjs.com/package/${name}`,
          downloads: data.downloads,
        };
        item.npm = npm;
      }

      // Grab package sizes from Package Phobia.
      if (item.npmPackage) {
        const name = item.npmPackage;
        const url = `https://packagephobia.com/result?p=${name}`;
        try {
          const { data } = await fetcher(
            `https://packagephobia.com/v2/api.json?p=${name}`,
          );
          // Package Phobia API returns publish and install sizes in bytes
          const publishSize =
            data.publish?.bytes ?? data.publishSize ?? data.size ?? 0;
          const installSize =
            data.install?.bytes ?? data.installSize ?? data.gzip ?? 0;
          item.packagephobia = {
            url,
            publishSize,
            installSize,
          };
        } catch (err) {
          // Package Phobia might error out, so let's do the best we can and
          // signal to the frontend that the API is broken.
          console.log("libraries: giving up getting package size for %s", name);
          item.packagephobia = { url, publishSize: -1, installSize: -1 };
        }
      }

      // Grab quality score and dependencies from npms.io.
      if (item.npmPackage) {
        const name = item.npmPackage;
        try {
          const { data } = await fetcher(
            `https://api.npms.io/v2/package/${name}`,
          );
          // Extract quality score (score.final) and round up to percentage
          const qualityScore = data.score?.final ?? 0;
          const quality = Math.ceil(qualityScore * 100);
          // Extract maintenance score (score.detail.maintenance) and round up to percentage
          const maintenanceScore = data.score?.detail?.maintenance ?? 0;
          const maintenance = Math.ceil(maintenanceScore * 100);
          // Extract dependencies count
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
          // npms.io might error out, so we'll just skip it
          console.log("libraries: giving up getting npms.io data for %s", name);
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

  // Just a quick sanity check here.
  if (items.length !== paths.length) {
    throw new Error(
      `Incomplete data. Parsed ${paths.length} YAML files but only got ${items.length} info objects.`,
    );
  }

  return items;
};
