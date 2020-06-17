import { readdirSync, readFileSync } from 'fs'
import yaml from 'js-yaml'
import { basename, join } from 'path'
import * as rt from 'runtypes'
import * as cache from './cache'
import { Features } from './features'
import { throttledFetch } from './utils'

//
// Yes, these types and things seem pretty overcomplicated, but it sure makes
// importing data and working with TypeScript a lot easier.
//

const URL = rt.String.withConstraint(
  (str) => /^https?:\/\//.test(str) || `${str} is not a valid URL`
)
const GitHubRepo = rt.String.withConstraint(
  (str) => /^\S+\/\S+$/.test(str) || `${str} is not a username/repo pair`
)
const Feature = rt.Boolean.Or(URL).Or(rt.String)

const FrameworkValue = URL.Or(rt.Boolean).Or(rt.Undefined)

const Frameworks = rt.Record({
  vanilla: FrameworkValue,
  react: FrameworkValue,
  vue: FrameworkValue,
  angular: FrameworkValue,
  jquery: FrameworkValue,
  ember: FrameworkValue,
})

export type FrameworkName = keyof rt.Static<typeof Frameworks>

// Validate and type the data we get from the YAML files in `data`.
const ImportedYAMLInfo = rt.Record({
  title: rt.String,
  description: rt.String,
  homeUrl: URL.Or(rt.Null),
  demoUrl: URL.Or(rt.Null),
  githubRepo: GitHubRepo.Or(rt.Null),
  npmPackage: rt.String.Or(rt.Null),
  ignoreBundlephobia: rt.Boolean.Or(rt.Undefined),
  license: rt.String.Or(rt.Null),
  revenueModel: rt.String.Or(rt.Null),
  frameworks: Frameworks,
  features: rt.Dictionary(Feature),
})

// Allow additional information to be added to the library info dictionaries.
const AugmentedInfo = rt.Record({
  ...ImportedYAMLInfo.fields,
  id: rt.String,
  github: rt
    .Record({
      url: URL,
      stars: rt.Number,
      forks: rt.Number,
      openIssues: rt.Number,
      watchers: rt.Number,
      subscribers: rt.Number,
      network: rt.Number,
      contributors: rt.Number,
    })
    .Or(rt.Undefined),
  npm: rt
    .Record({
      url: URL,
      downloads: rt.Number,
    })
    .Or(rt.Undefined),
  bundlephobia: rt
    .Record({
      url: URL,
      rawSize: rt.Number,
      gzipSize: rt.Number,
    })
    .Or(rt.Null)
    .Or(rt.Undefined),
})

// Make the final thing we return read-only.
const LibraryInfo = rt.Record(AugmentedInfo.fields).asReadonly()

type ImportedYAMLInfo = rt.Static<typeof ImportedYAMLInfo>
type AugmentedInfo = rt.Static<typeof AugmentedInfo>
export type LibraryInfo = rt.Static<typeof LibraryInfo>

const allowedFeatures = new Set(Object.keys(Features))

// Get all the library data, fetching from APIs or using the cache as necessary.
export const getLibraries = async (): Promise<LibraryInfo[]> => {
  // Get paths to all YAML files.
  const dataDir = join(process.cwd(), 'data')
  const paths = readdirSync(dataDir)
    .filter((name) => /\.yml$/.test(name))
    .map((name) => join(dataDir, name))

  const items: AugmentedInfo[] = []
  await Promise.all(
    paths.map(async (path) => {
      const id = basename(path, '.yml')

      // Load raw YAML data and make sure it validates.
      const obj = yaml.safeLoad(readFileSync(path, 'utf8'))
      let item: AugmentedInfo
      try {
        ImportedYAMLInfo.check(obj)
        item = AugmentedInfo.check({ id, ...obj })
      } catch (err) {
        throw new Error(
          `In ${path}, key "${err.key}" failed validation: ${err.message}`
        )
      }
      for (const key in item.features) {
        if (!allowedFeatures.has(key)) {
          throw new Error(`In ${path}, unexpected feature "${key}"`)
        }
      }

      // Populate GitHub data if the library has a GitHub repo.
      if (item.githubRepo) {
        const key1 = `gh-${item.githubRepo}-info`
        let gh: any = cache.get(key1)
        if (!gh) {
          try {
            const res = await throttledFetch(
              `https://api.github.com/repos/${item.githubRepo}`
            )
            if (res.data.full_name !== item.githubRepo) {
              throw new Error(
                `GitHub repo ${item.githubRepo} has moved to ${res.data.full_name}`
              )
            }

            gh = res.data
            cache.set(key1, gh)
          } catch (err) {
            throw new Error(`Error getting GitHub data for ${id}: ${err}`)
          }
        }

        const key2 = `gh-${item.githubRepo}-contributors`
        let stats: any = cache.get(key2)
        if (!stats) {
          try {
            const pageSize = 100
            const url = `https://api.github.com/repos/${item.githubRepo}/contributors?per_page=${pageSize}`
            const res1 = await throttledFetch(url)
            if (res1.data.length < pageSize || !res1.headers.link) {
              stats = { contributors: res1.data.length }
            } else {
              const lastPage = Number(
                res1.headers.link
                  .split(',')
                  .find((s?: string) => /rel="last"/.test(s))
                  .match(/\bpage=(\d+)/)[1]
              )
              const res2 = await throttledFetch(`${url}&page=${lastPage}`)
              const total = pageSize * (lastPage - 1) + res2.data.length
              stats = { contributors: total }
            }
            cache.set(key2, stats)
          } catch (err) {
            throw new Error(`Error getting GitHub stats for ${id}: ${err}`)
          }
        }

        item.github = {
          url: gh.html_url,
          stars: gh.stargazers_count,
          forks: gh.forks_count,
          openIssues: gh.open_issues_count,
          watchers: gh.watchers_count,
          subscribers: gh.subscribers_count,
          network: gh.network_count,
          contributors: stats.contributors,
        }
      }

      // Populate NPM data if the library has an NPM package name.
      if (item.npmPackage) {
        const name = item.npmPackage
        const key = `npm-${name}`
        let npm = cache.get(key)
        if (!npm) {
          try {
            const res = await throttledFetch(
              `https://api.npmjs.org/downloads/point/last-week/${name}`
            )
            npm = {
              url: `https://www.npmjs.com/package/${name}`,
              downloads: res.data.downloads,
            }
            cache.set(key, npm)
          } catch (err) {
            throw new Error(`Error getting NPM data for ${name}: ${err}`)
          }
        }
        item.npm = npm
      }

      // Grab bundle sizes from Bundlephobia.
      if (item.npmPackage && item.ignoreBundlephobia !== true) {
        const name = item.npmPackage
        const key = `bundlephobia-${name}`
        let bundlephobia = cache.get(key)
        if (!bundlephobia) {
          try {
            const res = await throttledFetch(
              `https://bundlephobia.com/api/size?package=${name}`
            )
            bundlephobia = {
              url: `https://bundlephobia.com/result?p=${name}`,
              rawSize: res.data.size,
              gzipSize: res.data.gzip,
            }
            cache.set(key, bundlephobia)
          } catch (err) {
            // For now, some packages like pqgrid seem to break their build system, so
            // ignore 500 errors.
            throw new Error(
              err.response
                ? `Bundlephobia API returned ${err.response.status} for package ${name}`
                : `Bundlephobia failed for package ${name}: ${err}`
            )
          }
        }
        item.bundlephobia = bundlephobia
      }

      items.push(AugmentedInfo.check(item))
    })
  )

  // Just a quick sanity check here.
  if (items.length !== paths.length) {
    throw new Error(
      `Incomplete data. Parsed ${paths.length} YAML files but only got ${items.length} info objects.`
    )
  }

  return items
}
