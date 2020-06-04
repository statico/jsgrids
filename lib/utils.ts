export const hasKeys = (obj: Object, keys: Iterable<string>) => {
  for (const key of Array.from(keys)) {
    if (!obj[key]) {
      return false
    }
  }
  return true
}
