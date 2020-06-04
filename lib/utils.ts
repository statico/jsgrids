import pThrottle from 'p-throttle'
import axios, { AxiosRequestConfig } from 'axios'

export const hasKeys = (obj: Object, keys: Iterable<string>) => {
  for (const key of Array.from(keys)) {
    if (!obj[key]) {
      return false
    }
  }
  return true
}

// Hammering APIs usually leads to trouble, and we don't really care about build
// time, so let's be nice.
export const throttledFetch = pThrottle(
  async (url: string) => {
    console.log(`Fetching ${url}`)
    try {
      const options: AxiosRequestConfig = {}
      if (process.env.GITHUB_TOKEN && /github.com/.test(url)) {
        options.headers = {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        }
      }
      return await axios.get(url, options)
    } catch (err) {
      const status = err.response?.status
      const headers = JSON.stringify(err.response?.headers, null, '  ')
      console.error(
        `Request to ${url} failed. status=${status} headers=${headers}`
      )
      throw err
    }
  },
  1,
  300
)
