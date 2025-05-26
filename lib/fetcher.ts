import pRetry from "p-retry";
import pThrottle from "p-throttle";
import * as cache from "./cache";

const throttler = pThrottle({ limit: 1, interval: 750 });

// Hammering APIs usually leads to trouble, and we don't really care about build
// time, so let's be nice.
const throttledFetch = throttler(async (url: string) => {
  const { GITHUB_TOKEN, VERCEL_URL, VERCEL_GITHUB_COMMIT_SHA } = process.env;
  if (!GITHUB_TOKEN) {
    throw new Error(
      "Please set a GITHUB_TOKEN. Otherwise you'll quickly exceed GitHub's API rate limits.",
    );
  }

  console.log("fetcher: get %s", url);
  try {
    // Be nice to our APIs. (File a GitHub issue if we aren't!)
    const ua = VERCEL_URL
      ? `jsgrids.statico.io (Netlify build ${VERCEL_URL} for commit ${VERCEL_GITHUB_COMMIT_SHA})`
      : `jsgrids.statico.io (local development)`;
    const headers: any = {
      "User-Agent": ua,
    };

    if (GITHUB_TOKEN && /github.com/.test(url)) {
      headers.Authorization = `token ${GITHUB_TOKEN}`;
      headers.Accept = "application/vnd.github.v3+json";
    }

    if (/bundlephobia/.test(url)) {
      // bundle-phobia-cli does something like this so let's follow suit.
      headers["X-Bundlephobia-User"] = ua;
    }

    const fn = async () => {
      const res = await fetch(url, { headers });
      const resHeaders = Object.fromEntries(res.headers.entries());
      const data = await res.json();
      return { headers: resHeaders, data };
    };

    return await pRetry(fn, {
      minTimeout: 2000,
      factor: 1,
      onFailedAttempt: (err) => {
        console.log(
          "fetcher: failed %s, attempt number = %d, retries left = %d",
          url,
          err.attemptNumber,
          err.retriesLeft,
        );
      },
    });
  } catch (err: any) {
    const res = err.response;
    const status = res?.status;
    const resHeaders = Object.fromEntries(res?.headers.entries());
    console.log(
      "fetcher: failed %s - status=%s, headers=%o - %s",
      url,
      status,
      resHeaders,
      err,
    );
    throw err;
  }
});

const cachedThrottledFetch = async (url: string) =>
  cache.fetch(url, () => throttledFetch(url));

export default cachedThrottledFetch;
