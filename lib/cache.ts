import * as crypto from "crypto"
import debug from "debug"
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "fs"
import { join } from "path"

const log = debug("cache")
log.enabled = true

//
// This is a simple filesystem cache because, amazingly, nothing on npm seemed
// to be this simple and this is easy to write.
//

const duration = 1000 * 60 * 60 * 24

const basedir = join(process.cwd(), ".cache")
mkdirSync(basedir, { recursive: true })
log("base directory is %s", basedir)

const keyToFilename = (key: string): string => {
  const hash = crypto.createHash("sha1")
  hash.update(key)
  return hash.digest("hex") + ".json"
}

const get = (key: string): any => {
  const path = join(basedir, keyToFilename(key))
  if (!existsSync(path)) {
    log("miss for %s", key)
    return null
  }

  const obj = JSON.parse(readFileSync(path, "utf8"))
  if (obj?.expiration >= Date.now()) {
    return obj?.data
  } else {
    log("expired %s", key)
    return null
  }
}

const set = (key: string, data: any): void => {
  log("write %s", key)
  const path = join(basedir, keyToFilename(key))
  const obj = JSON.stringify({ expiration: Date.now() + duration, data })
  writeFileSync(path, obj, "utf8")
}

const clear = (key: string): void => {
  log("clear %s", key)
  const path = join(basedir, keyToFilename(key))
  if (existsSync(path)) unlinkSync(path)
}

// Syntactic sugar to heop with the most common pattern.
const fetch = async (key: string, fn: () => Promise<any>): Promise<any> => {
  const cached = get(key)
  if (cached) return cached

  const fresh = await fn()
  if (fresh) set(key, fresh)
}

export { get, set, clear, fetch }
