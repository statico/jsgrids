import fetch from 'node-fetch'
import pThrottle from 'p-throttle'

const throttler = pThrottle({ limit: 1, interval: 300 })

// Hammering APIs usually leads to trouble, and we don't really care about build
// time, so let's be nice.
export const throttledFetch = throttler(async (url: string) => {
  const { GITHUB_TOKEN, VERCEL_URL, VERCEL_GITHUB_COMMIT_SHA } = process.env
  if (!GITHUB_TOKEN) {
    throw new Error(
      "Please set a GITHUB_TOKEN. Otherwise you'll quickly exceed GitHub's API rate limits."
    )
  }

  console.log(`Fetching ${url}`)
  try {
    // Be nice to our APIs. (File a GitHub issue if we aren't!)
    const ua = VERCEL_URL
      ? `jsgrids.statico.io (Netlify build ${VERCEL_URL} for commit ${VERCEL_GITHUB_COMMIT_SHA})`
      : `jsgrids.statico.io (local development)`
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

    const res = await fetch(url, { headers, timeout: 20000 })
    const data = await res.json()
    return { headers: res.headers, data }
  } catch (err) {
    const status = err.response?.status
    const headers = JSON.stringify(err.response?.headers, null, '  ')
    console.error(
      `Request to ${url} failed. status=${status} headers=${headers}`
    )
    throw err
  }
})

export const hasAllKeys = (obj: Object, keys: Iterable<string>) => {
  for (const key of Array.from(keys)) {
    if (!obj[key]) {
      return false
    }
  }
  return true
}
