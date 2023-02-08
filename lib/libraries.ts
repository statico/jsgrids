import debug from "debug";
import { readdirSync, readFileSync } from "fs";
import * as yaml from "js-yaml";
import { basename, join } from "path";
import * as rt from "runtypes";
import { Features } from "./features";
import fetcher from "./fetcher";

const log = debug("libraries");
log.enabled = true;

//
// Yes, these types and things seem pretty overcomplicated, but it sure makes
// importing data and working with TypeScript a lot easier.
//

const URL = rt.String.withConstraint(
  (str) => /^https?:\/\//.test(str) || `${str} is not a valid URL`
);
const GitHubRepo = rt.String.withConstraint(
  (str) => /^\S+\/\S+$/.test(str) || `${str} is not a username/repo pair`
);
const Feature = rt.Boolean.Or(URL).Or(rt.String);

const FrameworkValue = rt.Optional(URL.Or(rt.Boolean));

const Frameworks = rt.Record({
  vanilla: FrameworkValue,
  typescript: FrameworkValue,
  react: FrameworkValue,
  vue: FrameworkValue,
  angular: FrameworkValue,
  jquery: FrameworkValue,
  ember: FrameworkValue,
});

export type FrameworkName = keyof rt.Static<typeof Frameworks>;

// Validate and type the data we get from the YAML files in `data`.
const ImportedYAMLInfo = rt.Record({
  title: rt.String,
  description: rt.String,
  homeUrl: URL.Or(rt.Null),
  demoUrl: URL.Or(rt.Null),
  githubRepo: GitHubRepo.Or(rt.Null),
  npmPackage: rt.String.Or(rt.Null),
  ignoreBundlephobia: rt.Optional(rt.Boolean),
  license: rt.String.Or(rt.Null),
  revenueModel: rt.String.Or(rt.Null),
  frameworks: Frameworks,
  features: rt.Dictionary(Feature),
});

// Allow additional information to be added to the library info dictionaries.
const AugmentedInfo = rt.Record({
  ...ImportedYAMLInfo.fields,
  id: rt.String,
  github: rt.Optional(
    rt.Record({
      url: URL,
      stars: rt.Number,
      forks: rt.Number,
      openIssues: rt.Number,
      watchers: rt.Number,
      subscribers: rt.Number,
      network: rt.Number,
      contributors: rt.Number,
    })
  ),
  npm: rt.Optional(
    rt.Record({
      url: URL,
      downloads: rt.Number,
    })
  ),
  bundlephobia: rt.Optional(
    rt
      .Record({
        url: URL,
        rawSize: rt.Number,
        gzipSize: rt.Number,
      })
      .Or(rt.Null)
  ),
});

// Make the final thing we return read-only.
const LibraryInfo = rt.Record(AugmentedInfo.fields).asReadonly();

type ImportedYAMLInfo = rt.Static<typeof ImportedYAMLInfo>;
type AugmentedInfo = rt.Static<typeof AugmentedInfo>;
export type LibraryInfo = rt.Static<typeof LibraryInfo>;

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
      const obj = yaml.load(readFileSync(path, "utf8"));
      if (typeof obj !== "object") {
        throw new Error(`Expected ${path} to be an object`);
      }

      let item: AugmentedInfo;
      try {
        ImportedYAMLInfo.check(obj);
        item = AugmentedInfo.check({ id, ...obj });
      } catch (err: any) {
        throw new Error(
          `In ${path}, key "${err.key}" failed validation: ${err.message}`
        );
      }

      for (const key in item.features) {
        if (!allowedFeatures.has(key)) {
          throw new Error(`In ${path}, unexpected feature "${key}"`);
        }
      }

      // Populate GitHub data if the library has a GitHub repo.
      if (item.githubRepo) {
        const { data: repo } = await fetcher(
          `https://api.github.com/repos/${item.githubRepo}`
        );
        if (repo.error) {
          throw new Error(
            `GitHub repo ${item.githubRepo} error: ${repo.error}`
          );
        }
        if (repo.full_name !== item.githubRepo) {
          throw new Error(
            `GitHub repo ${item.githubRepo} has moved to ${repo.full_name}`
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
          `https://api.npmjs.org/downloads/point/last-week/${name}`
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
        const { data } = await fetcher(
          `https://bundlephobia.com/api/size?package=${name}`
        );
        const bundlephobia = {
          url: `https://bundlephobia.com/result?p=${name}`,
          rawSize: data.size || 0,
          gzipSize: data.gzip || 0,
        };
        item.bundlephobia = bundlephobia;
      }

      try {
        items.push(AugmentedInfo.check(item));
      } catch (err: any) {
        const details = JSON.stringify(err.details);
        throw new Error(`AugmentedInfo for ${path}: ${details}`);
      }
    })
  );

  // Just a quick sanity check here.
  if (items.length !== paths.length) {
    throw new Error(
      `Incomplete data. Parsed ${paths.length} YAML files but only got ${items.length} info objects.`
    );
  }

  return items;
};
