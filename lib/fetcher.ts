import pRetry, { AbortError } from "p-retry";
import pThrottle from "p-throttle";
import * as cache from "./cache";

const throttler = pThrottle({ limit: 1, interval: 750 });

// Hammering APIs usually leads to trouble, and we don't really care about build
// time, so let's be nice.
const throttledFetch = throttler(async (url: string) => {
  const { GITHUB_TOKEN, NPM_TOKEN, VERCEL_URL, VERCEL_GITHUB_COMMIT_SHA } =
    process.env;
  if (!GITHUB_TOKEN) {
    throw new Error(
      "Please set a GITHUB_TOKEN. Otherwise you'll quickly exceed GitHub's API rate limits.",
    );
  }

  console.log("fetcher: get %s", url);
  try {
    // Be nice to our APIs. (File a GitHub issue if we aren't!)
    const ua = VERCEL_URL
      ? `https://jsgrids.statico.io (Netlify build ${VERCEL_URL} for commit ${VERCEL_GITHUB_COMMIT_SHA})`
      : `https://jsgrids.statico.io (local development)`;
    const headers: any = {
      "User-Agent": ua,
    };

    if (GITHUB_TOKEN && /github.com/.test(url)) {
      headers.Authorization = `token ${GITHUB_TOKEN}`;
      headers.Accept = "application/vnd.github.v3+json";
    }

    if (NPM_TOKEN && /npmjs\.org/.test(url)) {
      headers.Authorization = `Bearer ${NPM_TOKEN}`;
    }

    if (/packagephobia/.test(url)) {
      // Package Phobia API requires User-Agent header to avoid being blocked.
      // See: https://github.com/styfle/packagephobia/blob/main/API.md
      headers["User-Agent"] = ua;
    }

    const fn = async () => {
      const res = await fetch(url, { headers });
      const resHeaders = Object.fromEntries(res.headers.entries());
      // Check status before parsing JSON - error pages may return HTML
      if (!res.ok) {
        const message = `Request to ${url} failed with status ${res.status}`;
        // Don't retry on 403/404 - these are permanent failures
        if (res.status === 403 || res.status === 404) {
          throw new AbortError(message);
        }
        throw new Error(message);
      }
      const data = await res.json();
      return { headers: resHeaders, data };
    };

    const isPackagePhobia = /packagephobia/.test(url);
    return await pRetry(fn, {
      minTimeout: 3000,
      factor: 1,
      retries: isPackagePhobia ? 1 : 3,
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
    const resHeaders = Object.fromEntries(res?.headers?.entries() ?? []);
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
