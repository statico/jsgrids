import pRetry, { AbortError } from "p-retry";
import pThrottle from "p-throttle";
import * as cache from "./cache";

// Sentinel value for 304 Not Modified responses
const NOT_MODIFIED = Symbol("NOT_MODIFIED");

interface ConditionalHeaders {
  etag?: string;
  lastModified?: string;
}

// Throttler for non-npm APIs (GitHub, Package Phobia, npms.io)
const throttler = pThrottle({ limit: 5, interval: 1000 });

// Dynamic throttler for npm requests
// Start at 2 seconds (30 per minute), increase on 429 errors
let npmThrottleInterval = 2000; // 2 seconds in milliseconds
let npmThrottler = pThrottle({ limit: 1, interval: npmThrottleInterval });

// Helper to recreate npm throttler with new interval
const recreateNpmThrottler = (newInterval: number) => {
  npmThrottleInterval = newInterval;
  npmThrottler = pThrottle({ limit: 1, interval: npmThrottleInterval });
  console.log(
    "fetcher: npm throttle interval increased to %d seconds",
    newInterval / 1000,
  );
  // Recreate the throttled fetch function with the new throttler
  npmThrottledFetch = npmThrottler(createNpmFetchFunction());
};

// Check if URL is an npm API request
const isNpmRequest = (url: string): boolean => {
  return /npmjs\.org/.test(url);
};

// Request timeout in milliseconds (10 seconds for most, 5 seconds for packagephobia)
const REQUEST_TIMEOUT = 10000;
const PACKAGEPHOBIA_TIMEOUT = 5000;

// Global deadline for all fetches during page generation.
// Default 14 minutes (1 min less than Hobby plan timeout), configurable via
// FETCH_DEADLINE_MINUTES env var.
const deadlineMinutes = Number(process.env.FETCH_DEADLINE_MINUTES) || 14;
const fetchDeadline = Date.now() + deadlineMinutes * 60 * 1000;
console.log("fetcher: deadline set to %d minutes", deadlineMinutes);

// Core fetch logic (shared between npm and non-npm requests)
const fetchWithHeaders = async (
  url: string,
  conditional?: ConditionalHeaders,
) => {
  const { GITHUB_TOKEN, NPM_TOKEN, VERCEL_URL, VERCEL_GITHUB_COMMIT_SHA } =
    process.env;
  if (!GITHUB_TOKEN) {
    throw new Error(
      "Please set a GITHUB_TOKEN. Otherwise you'll quickly exceed GitHub's API rate limits.",
    );
  }

  console.log("fetcher: get %s", url);
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

  // Add conditional request headers for cache validation
  if (conditional?.etag) {
    headers["If-None-Match"] = conditional.etag;
  }
  if (conditional?.lastModified) {
    headers["If-Modified-Since"] = conditional.lastModified;
  }

  // Add timeout using AbortController - shorter timeout for packagephobia
  const timeout = /packagephobia/.test(url)
    ? PACKAGEPHOBIA_TIMEOUT
    : REQUEST_TIMEOUT;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeoutId);
    const resHeaders = Object.fromEntries(res.headers.entries());
    return { res, resHeaders };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      const timeout = /packagephobia/.test(url)
        ? PACKAGEPHOBIA_TIMEOUT
        : REQUEST_TIMEOUT;
      throw new Error(`Request to ${url} timed out after ${timeout}ms`);
    }
    throw err;
  }
};

// Create the npm fetch function (used to recreate throttled function)
const createNpmFetchFunction = () => {
  return async (url: string, conditional?: ConditionalHeaders) => {
    try {
      const fn = async () => {
        const { res, resHeaders } = await fetchWithHeaders(url, conditional);
        if (res.status === 304) {
          console.log("fetcher: 304 not modified %s", url);
          return NOT_MODIFIED;
        }
        // Check status before parsing JSON - error pages may return HTML
        if (!res.ok) {
          const message = `Request to ${url} failed with status ${res.status}`;
          // Handle 429 rate limit errors with dynamic backoff
          if (res.status === 429) {
            const newInterval = npmThrottleInterval * 2; // Double the interval
            recreateNpmThrottler(newInterval);
            // Throw error to trigger retry with new throttler
            throw new Error(message);
          }
          // Don't retry on 403/404 - these are permanent failures
          if (res.status === 403 || res.status === 404) {
            throw new AbortError(message);
          }
          throw new Error(message);
        }
        const data = await res.json();
        return { headers: resHeaders, data };
      };

      return await pRetry(fn, {
        minTimeout: 2000,
        factor: 1,
        retries: 2, // Reduced from 3 to fail faster
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
      console.log("fetcher: error %s - %s", url, err.message);
      throw err;
    }
  };
};

// NPM-specific fetch with dynamic backoff on 429 errors
let npmThrottledFetch = npmThrottler(createNpmFetchFunction());

// Hammering APIs usually leads to trouble, and we don't really care about build
// time, so let's be nice.
const throttledFetch = throttler(
  async (url: string, conditional?: ConditionalHeaders) => {
    try {
      const fn = async () => {
        const { res, resHeaders } = await fetchWithHeaders(url, conditional);
        if (res.status === 304) {
          console.log("fetcher: 304 not modified %s", url);
          return NOT_MODIFIED;
        }
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
      const isNpms = /npms\.io/.test(url);
      // Reduce retries for unreliable APIs - npms.io often returns 404s for valid packages
      // and packagephobia can be slow/unreliable
      const retries = isPackagePhobia || isNpms ? 0 : 3;
      return await pRetry(fn, {
        minTimeout: 2000,
        factor: 1,
        retries,
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
      console.log("fetcher: error %s - %s", url, err.message);
      throw err;
    }
  },
);

const cachedThrottledFetch = async (url: string) => {
  const entry = cache.get(url);

  // If cached data is still fresh (within TTL), return it immediately
  if (entry?.fresh) {
    return entry.data;
  }

  // If we've exceeded the deadline, return cached data or throw
  if (Date.now() > fetchDeadline) {
    if (entry) {
      console.log("fetcher: deadline exceeded, using cached data for %s", url);
      return entry.data;
    }
    throw new Error(`Fetch deadline exceeded and no cached data for ${url}`);
  }

  // Build conditional request headers from stale cached response
  const conditional: ConditionalHeaders | undefined = entry
    ? {
        etag: entry.data.headers?.etag,
        lastModified: entry.data.headers?.["last-modified"],
      }
    : undefined;

  // Route npm requests to npm throttler, others to regular throttler
  const fetchFn = isNpmRequest(url) ? npmThrottledFetch : throttledFetch;
  const result = await fetchFn(url, conditional);

  if (result === NOT_MODIFIED) {
    // Revalidated — update the timestamp so TTL resets
    cache.set(url, entry!.data);
    return entry!.data;
  }

  cache.set(url, result);
  return result;
};

export default cachedThrottledFetch;
