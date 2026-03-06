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
// Simple filesystem cache. No time-based expiry — freshness is determined
// by conditional HTTP requests (ETag / If-Modified-Since) in the fetcher.
//

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

const get = (key: string): any => {
  const path = join(basedir, keyToFilename(key));
  if (!existsSync(path)) {
    console.log("cache: miss for %s", key);
    return null;
  }

  const obj = JSON.parse(readFileSync(path, "utf8"));
  // Support old format { expiration, data } and new format { data }
  return obj?.data ?? null;
};

const set = (key: string, data: any): void => {
  console.log("cache: write %s", key);
  const path = join(basedir, keyToFilename(key));
  writeFileSync(path, JSON.stringify({ data }), "utf8");
};

const clear = (key: string): void => {
  console.log("cache: clear %s", key);
  const path = join(basedir, keyToFilename(key));
  if (existsSync(path)) unlinkSync(path);
};

export { get, set, clear };
