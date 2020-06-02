import yaml from 'js-yaml'
import axios from 'axios'
import { join, basename } from 'path'
import { readdirSync, readFileSync } from 'fs'
import * as rt from 'runtypes'
import { FEATURES } from './features'
import * as NpmApi from 'npm-api'
import * as cache from './cache'

const npmClient = new NpmApi()

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
      contributors: rt.Number,
    })
    .Or(rt.Undefined),
  npmPackage: rt.String.Or(rt.Null),
  npm: rt
    .Record({
      url: URL,
      downloads: rt.Number,
    })
    .Or(rt.Undefined),
  license: rt.String.Or(rt.Null),
  revenueModel: rt.String.Or(rt.Null),
  frameworks: Frameworks,
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

      if (item.githubRepo) {
        // Cache responses because the GitHub public API limits are pretty low.
        const key1 = `gh-${item.githubRepo}-info`
        let gh: any = cache.get(key1)
        if (!gh) {
          try {
            const url = `https://api.github.com/repos/${item.githubRepo}`
            console.log(`Fetching ${url}`)

            const res = await axios.get(url)
            if (res.data.full_name !== item.githubRepo) {
              throw new Error(
                `GitHub repo ${item.githubRepo} has moved to ${res.data.full_name}`
              )
            }

            gh = res.data
            cache.set(key1, gh)
          } catch (err) {
            console.error(`Error getting GitHub data for ${id}: ${err}`)
          }
        }

        const key2 = `gh-${item.githubRepo}-contributors`
        let stats: any = cache.get(key2)
        if (!stats) {
          try {
            const pageSize = 100
            const url = `https://api.github.com/repos/${item.githubRepo}/contributors?per_page=${pageSize}`
            console.log(`Fetching ${url}`)
            const res1 = await axios.get(url)
            if (res1.data.length < pageSize || !res1.headers.link) {
              stats = { contributors: res1.data.length }
            } else {
              const lastPage = Number(
                res1.headers.link
                  .split(',')
                  .find((s) => /rel="last"/.test(s))
                  .match(/\bpage=(\d+)/)[1]
              )
              const url2 = `${url}&page=${lastPage}`
              console.log(`Fetching ${url2}`)
              const res2 = await axios.get(url2)
              const total = pageSize * (lastPage - 1) + res2.data.length
              stats = { contributors: total }
            }
            cache.set(key2, stats)
          } catch (err) {
            console.error(`Error getting GitHub stats for ${id}: ${err}`)
          }
        }

        if (!stats) {
          console.log('XXX', item.githubRepo, 'missing stats')
          return
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

      if (item.npmPackage) {
        const key = `npm-${item.npmPackage}`
        let npm = cache.get(key)
        if (!npm) {
          try {
            console.log(`Fetching downloads for NPM package ${item.npmPackage}`)
            const repo = await npmClient.repo(item.npmPackage)
            npm = {
              url: `https://www.npmjs.com/package/${item.npmPackage}`,
              downloads: await repo.last(7),
            }
            cache.set(key, npm)
          } catch (err) {
            console.error(
              `Error getting NPM data for ${item.npmPackage}: ${err}`
            )
          }
        }
        item.npm = npm
      }

      items.push(AugmentedInfo.check(item))
    })
  )

  return items
}
