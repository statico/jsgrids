import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"
import * as crypto from "crypto"

//
// This is a simple filesystem cache because, amazingly, nothing on npm seemed
// to be this simple and this is easy to write.
//

const duration = 1000 * 60 * 60 * 24

const basedir = join(process.cwd(), ".cache")
mkdirSync(basedir, { recursive: true })
console.log(`Cache base directory is ${basedir}`)

const keyToFilename = (key: string): string => {
  const hash = crypto.createHash("sha1")
  hash.update(key)
  return hash.digest("hex") + ".json"
}

const get = (key: string): any => {
  const path = join(basedir, keyToFilename(key))
  if (!existsSync(path)) {
    console.log(`Cache miss for key "${key}"`)
    return null
  }
  const obj = JSON.parse(readFileSync(path, "utf8"))
  if (obj?.expiration >= Date.now()) {
    return obj?.data
  } else {
    console.log(`Cache expired for key "${key}"`)
    return null
  }
}

const set = (key: string, data: any): void => {
  const path = join(basedir, keyToFilename(key))
  const obj = JSON.stringify({ expiration: Date.now() + duration, data })
  writeFileSync(path, obj, "utf8")
  console.log(`Cache write for key "${key}"`)
}

export { get, set }
