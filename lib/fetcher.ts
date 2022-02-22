import debug from "debug"
import pThrottle from "p-throttle"
import fetch from "cross-fetch"
import * as cache from "./cache"

const log = debug("fetcher")
log.enabled = true

const throttler = pThrottle({ limit: 1, interval: 300 })

// Hammering APIs usually leads to trouble, and we don't really care about build
// time, so let's be nice.
const throttledFetch = throttler(async (url: string) => {
  const { GITHUB_TOKEN, VERCEL_URL, VERCEL_GITHUB_COMMIT_SHA } = process.env
  if (!GITHUB_TOKEN) {
    throw new Error(
      "Please set a GITHUB_TOKEN. Otherwise you'll quickly exceed GitHub's API rate limits."
    )
  }

  log("get %s", url)
  try {
    // Be nice to our APIs. (File a GitHub issue if we aren't!)
    const ua = VERCEL_URL
      ? `jsgrids.statico.io (Netlify build ${VERCEL_URL} for commit ${VERCEL_GITHUB_COMMIT_SHA})`
      : `jsgrids.statico.io (local development)`
    const headers: any = {
      "User-Agent": ua,
    }

    if (GITHUB_TOKEN && /github.com/.test(url)) {
      headers.Authorization = `token ${GITHUB_TOKEN}`
    }

    if (/bundlephobia/.test(url)) {
      // bundle-phobia-cli does something like this so let's follow suit.
      headers["X-Bundlephobia-User"] = ua
    }

    const res = await fetch(url, { headers })
    const data = await res.json()
    return { headers: JSON.parse(JSON.stringify(res.headers)), data }
  } catch (err) {
    const status = err.response?.status
    const headers = JSON.stringify(err.response?.headers, null, "  ")
    log("failed %s - status=%s, headers=%o - %s", url, status, headers, err)
    throw err
  }
})

const cachedThrottledFetch = async (url: string) => {
  return cache.fetch(url, () => throttledFetch(url))
}

export default cachedThrottledFetch
