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
// This is a simple filesystem cache because, amazingly, nothing on npm seemed
// to be this simple and this is easy to write.
//

const expiryInMs = 1000 * 60 * 60 * 24;

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
  if (obj?.expiration >= Date.now()) {
    return obj?.data;
  } else {
    console.log("cache: expired %s", key);
    return null;
  }
};

const set = (key: string, data: any): void => {
  console.log("cache: write %s", key);
  const path = join(basedir, keyToFilename(key));
  const obj = JSON.stringify({
    expiration: Date.now() + expiryInMs,
    data,
  });
  writeFileSync(path, obj, "utf8");
};

const clear = (key: string): void => {
  console.log("cache: clear %s", key);
  const path = join(basedir, keyToFilename(key));
  if (existsSync(path)) unlinkSync(path);
};

// Syntactic sugar to heop with the most common pattern.
const fetch = async (key: string, fn: () => Promise<any>): Promise<any> => {
  const cached = get(key);
  if (cached) return cached;

  const fresh = await fn();
  if (fresh) set(key, fresh);
  return fresh;
};

export { get, set, clear, fetch };
