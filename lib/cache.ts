import * as crypto from "crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { join } from "path";

//
// Simple filesystem cache with a soft TTL. Within the TTL, cached data is
// returned immediately (no network request). After the TTL expires, the
// fetcher makes conditional HTTP requests (ETag / If-Modified-Since) to
// revalidate. Default TTL is 1 hour, configurable via CACHE_TTL_MINUTES.
//

const ttlMinutes = Number(process.env.CACHE_TTL_MINUTES) || 1440;
const ttlMs = ttlMinutes * 60 * 1000;

// Put the cache in the .next/cache/jsgrids directory so that it is
// automatically cached by Vercel.
const basedir = join(process.cwd(), ".next/cache/jsgrids");
mkdirSync(basedir, { recursive: true });
console.log("cache: base directory is %s", basedir);

const keyToFilename = (key: string): string => {
  const hash = crypto.createHash("sha256");
  hash.update(key);
  return hash.digest("hex") + ".json";
};

interface CacheResult {
  data: any;
  fresh: boolean;
}

const get = (key: string): CacheResult | null => {
  const path = join(basedir, keyToFilename(key));
  if (!existsSync(path)) {
    console.log("cache: miss for %s", key);
    return null;
  }

  const obj = JSON.parse(readFileSync(path, "utf8"));
  const data = obj?.data ?? null;
  if (data === null) return null;

  // Check freshness using stored timestamp, or treat old-format entries as stale
  const fresh = typeof obj?.timestamp === "number" && Date.now() - obj.timestamp < ttlMs;
  return { data, fresh };
};

const set = (key: string, data: any): void => {
  console.log("cache: write %s", key);
  const path = join(basedir, keyToFilename(key));
  writeFileSync(path, JSON.stringify({ data, timestamp: Date.now() }), "utf8");
};

const clear = (key: string): void => {
  console.log("cache: clear %s", key);
  const path = join(basedir, keyToFilename(key));
  if (existsSync(path)) unlinkSync(path);
};

export { get, set, clear };
