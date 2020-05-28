import yaml from 'js-yaml'
import axios from 'axios'
import { join, basename } from 'path'
import { readdirSync, readFileSync } from 'fs'
import * as rt from 'runtypes'
import * as flatCache from 'flat-cache'

const URL = rt.String.withConstraint(
  (str) => /^https?:\/\//.test(str) || `${str} is not a valid URL`
)
const GitHubRepo = rt.String.withConstraint(
  (str) => /^\S+\/\S+$/.test(str) || `${str} is not a username/repo pair`
)
const Feature = rt.Boolean.Or(URL).Or(rt.String)

const RawSpec = rt.Record({
  id: rt.String,
  title: rt.String,
  description: rt.String,
  homeUrl: URL.Or(rt.Null),
  demoUrl: URL.Or(rt.Null),
  githubRepo: GitHubRepo,
  github: rt
    .Record({
      stars: rt.Number,
      forks: rt.Number,
      openIssues: rt.Number,
      watchers: rt.Number,
      subscribers: rt.Number,
      network: rt.Number,
    })
    .Or(rt.Undefined),
  license: rt.String.Or(rt.Null),
  revenueModel: rt.String.Or(rt.Null),
  maintained: rt.Boolean,
  features: rt.Dictionary(Feature),
})

const Spec = rt
  .Record({ ...RawSpec.fields, features: rt.Dictionary(Feature) })
  .asReadonly()

const Specs = rt.Dictionary(Spec)

type RawSpec = rt.Static<typeof RawSpec>
type Spec = rt.Static<typeof Spec>
type Specs = rt.Static<typeof Specs>

export const getData = async (): Promise<Specs> => {
  const dataDir = join(process.cwd(), 'data')
  const paths = readdirSync(dataDir)
    .filter((name) => /\.yml$/.test(name))
    .map((name) => join(dataDir, name))

  const cache = flatCache.load('jgrids-data')

  const specs: Specs = {}

  await Promise.all(
    paths.map(async (path) => {
      const id = basename(path, '.yml')

      const obj = yaml.safeLoad(await readFileSync(path, 'utf8'))
      let spec: RawSpec
      try {
        spec = RawSpec.check({
          id,
          ...obj,
        })
      } catch (err) {
        throw new Error(
          `In ${basename(path)}, key "${err.key}" failed validation: ${
            err.message
          }`
        )
      }

      try {
        if (spec.githubRepo) {
          // Cache responses because the GitHub public API limits are pretty low.
          const key = `github-${spec.githubRepo}`
          let gh: any = cache.getKey(key)

          if (!gh || gh.expires < Date.now()) {
            const url = `https://api.github.com/repos/${spec.githubRepo}`
            console.log(`Fetching ${url}`)

            const res = await axios.get(url)
            if (res.data.full_name !== spec.githubRepo) {
              throw new Error(
                `GitHub repo ${spec.githubRepo} has moved to ${res.data.full_name}`
              )
            }

            gh = {
              expires: Date.now() + 60 * 60 * 1000,
              data: res.data,
            }
            cache.setKey(key, gh)
            cache.save()
          }

          spec.github = {
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

      specs[id] = Spec.check(spec)
    })
  )

  return specs
}
