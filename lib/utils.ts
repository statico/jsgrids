import axios from 'axios'
import pThrottle from 'p-throttle'

// Hammering APIs usually leads to trouble, and we don't really care about build
// time, so let's be nice.
export const throttledFetch = pThrottle(
  async (url: string) => {
    const { GITHUB_TOKEN, NETLIFY, COMMIT_REF, BUILD_ID } = process.env
    if (!GITHUB_TOKEN) {
      throw new Error(
        "Please set a GITHUB_TOKEN. Otherwise you'll quickly exceed GitHub's API rate limits."
      )
    }

    console.log(`Fetching ${url}`)
    try {
      // Be nice to our APIs. (File a GitHub issue if we aren't!)
      const ua = NETLIFY
        ? `jsgrids.io (Netlify build ${BUILD_ID} for commit ${COMMIT_REF})`
        : `jsgrids.io (local development)`
      const headers: any = {
        'User-Agent': ua,
      }
      if (GITHUB_TOKEN && /github.com/.test(url)) {
        headers.Authorization = `token ${GITHUB_TOKEN}`
      }
      if (/bundlephobia/.test(url)) {
        // bundle-phobia-cli does something like this so let's follow suit.
        headers['X-Bundlephobia-User'] = ua
      }

      return await axios.get(url, { headers, timeout: 5000 })
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

export const hasAllKeys = (obj: Object, keys: Iterable<string>) => {
  for (const key of Array.from(keys)) {
    if (!obj[key]) {
      return false
    }
  }
  return true
}
