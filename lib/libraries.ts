import yaml from 'js-yaml'
import axios from 'axios'
import { join, basename } from 'path'
import { readdirSync, readFileSync } from 'fs'
import * as rt from 'runtypes'
import * as flatCache from 'flat-cache'
import { FEATURES } from './features'
import * as NpmApi from 'npm-api'

const URL = rt.String.withConstraint(
  (str) => /^https?:\/\//.test(str) || `${str} is not a valid URL`
)
const GitHubRepo = rt.String.withConstraint(
  (str) => /^\S+\/\S+$/.test(str) || `${str} is not a username/repo pair`
)
const Feature = rt.Boolean.Or(URL).Or(rt.String)
const Framework = rt.Union(
  rt.Literal('vanilla'),
  rt.Literal('react'),
  rt.Literal('vue'),
  rt.Literal('angular'),
  rt.Literal('jquery')
)

const RawInfo = rt.Record({
  id: rt.String,
  title: rt.String,
  description: rt.String,
  homeUrl: URL.Or(rt.Null),
  demoUrl: URL.Or(rt.Null),
  githubRepo: GitHubRepo.Or(rt.Null),
  github: rt
    .Record({
      url: URL,
      stars: rt.Number,
      forks: rt.Number,
      openIssues: rt.Number,
      watchers: rt.Number,
      subscribers: rt.Number,
      network: rt.Number,
    })
    .Or(rt.Undefined),
  npmPackage: rt.String.Or(rt.Null),
  npm: rt
    .Record({
      downloads: rt.Number,
    })
    .Or(rt.Undefined),
  license: rt.String.Or(rt.Null),
  revenueModel: rt.String.Or(rt.Null),
  frameworks: rt.Array(Framework),
  features: rt.Dictionary(Feature),
})

const AugmentedInfo = rt
  .Record({
    ...RawInfo.fields,
    features: rt.Dictionary(Feature),
  })
  .asReadonly()

type RawInfo = rt.Static<typeof RawInfo>
export type AugmentedInfo = rt.Static<typeof AugmentedInfo>

const allowedFeatures = new Set(Object.keys(FEATURES))

export const getLibraries = async (): Promise<AugmentedInfo[]> => {
  const dataDir = join(process.cwd(), 'data')
  const paths = readdirSync(dataDir)
    .filter((name) => /\.yml$/.test(name))
    .map((name) => join(dataDir, name))

  const cache = flatCache.load('jgrids-data')
  const npm = new NpmApi()

  const items: AugmentedInfo[] = []

  await Promise.all(
    paths.map(async (path) => {
      const id = basename(path, '.yml')

      const obj = yaml.safeLoad(await readFileSync(path, 'utf8'))
      let item: RawInfo
      try {
        item = RawInfo.check({
          id,
          ...obj,
        })
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

      try {
        if (item.githubRepo) {
          // Cache responses because the GitHub public API limits are pretty low.
          const key = `github-${item.githubRepo}`
          let gh: any = cache.getKey(key)

          if (!gh || gh.expires < Date.now()) {
            const url = `https://api.github.com/repos/${item.githubRepo}`
            console.log(`Fetching ${url}`)

            const res = await axios.get(url)
            if (res.data.full_name !== item.githubRepo) {
              throw new Error(
                `GitHub repo ${item.githubRepo} has moved to ${res.data.full_name}`
              )
            }

            gh = {
              expires: Date.now() + 60 * 60 * 1000,
              data: res.data,
            }
            cache.setKey(key, gh)
            cache.save(true)
          }

          item.github = {
            url: gh.data.html_url,
            stars: gh.data.stargazers_count,
            forks: gh.data.forks_count,
            openIssues: gh.data.open_issues_count,
            watchers: gh.data.watchers_count,
            subscribers: gh.data.subscribers_count,
            network: gh.data.network_count,
          }
        }
      } catch (err) {
        console.error(`Error getting GitHub data for ${id}: ${err}`)
      }

      try {
        if (item.npmPackage) {
          console.log(`Fetching downloads for NPM package ${item.npmPackage}`)
          const repo = await npm.repo(item.npmPackage)
          item.npm = {
            downloads: await repo.last(7),
          }
        }
      } catch (err) {
        console.error(`Error getting NPM data for ${item.npmPackage}: ${err}`)
      }

      items.push(AugmentedInfo.check(item))
    })
  )

  return items
}
