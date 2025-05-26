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
  ignoreBundlephobia: z.boolean().optional(),
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
  bundlephobia: z
    .union([
      z.object({
        url: URL,
        rawSize: z.number(),
        gzipSize: z.number(),
      }),
      z.null(),
    ])
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

      // Grab bundle sizes from Bundlephobia.
      if (item.npmPackage && item.ignoreBundlephobia !== true) {
        const name = item.npmPackage;
        const url = `https://bundlephobia.com/result?p=${name}`;
        try {
          const { data } = await fetcher(
            `https://bundlephobia.com/api/size?package=${name}`,
          );
          item.bundlephobia = {
            url,
            rawSize: data.size || 0,
            gzipSize: data.gzip || 0,
          };
        } catch (err) {
          // Bundlephobia constantly errors out, even after retrying. So let's do
          // the best we can and signal to the frontend that the API is broken.
          console.log("libraries: giving up getting bundle size for %s", name);
          item.bundlephobia = { url, rawSize: -1, gzipSize: -1 };
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
