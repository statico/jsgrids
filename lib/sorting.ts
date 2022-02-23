import { FeatureName } from "./features"
import { LibraryInfo } from "./libraries"

export interface SortOption {
  key: "popularity" | "stars" | "downloads"
  title: string
  description?: string
  fn: (a: LibraryInfo, b: LibraryInfo) => number
}

export type SortOptionKey = SortOption["key"]
export const SortOptions: SortOption[] = [
  {
    key: "popularity",
    title: "Popularity",
    description: "GitHub stars + NPM downloads",
    fn: (a, b) => {
      const av = (a.github?.stars || 0) + (a.npm?.downloads || 0)
      const bv = (b.github?.stars || 0) + (b.npm?.downloads || 0)
      return bv - av
    },
  },
  {
    key: "stars",
    title: "GitHub Stars",
    fn: (a, b) => (b.github?.stars || 0) - (a.github?.stars || 0),
  },
  {
    key: "downloads",
    title: "NPM Weekly Downloads",
    fn: (a, b) => (b.npm?.downloads || 0) - (a.npm?.downloads || 0),
  },
]

// Sort the features by negative ones first, then positive, then middling.
// Only important negative features are shown, which is why they're first.
export const sortedFeatureNames = (
  features: LibraryInfo["features"]
): FeatureName[] =>
  Object.keys(features).sort((a, b) => {
    const av = features[a]
    const bv = features[b]
    if (!av) {
      return -1
    } else if (!bv) {
      return 1
    } else if (av === true && bv === true) {
      return a.localeCompare(b)
    } else if (typeof av === "string" && typeof bv === "string") {
      return a.localeCompare(b)
    } else if (av === true) {
      return -1
    } else if (bv === true) {
      return 1
    } else {
      return a.localeCompare(b)
    }
  }) as FeatureName[]

export const hasAllKeys = (obj: any, keys: Iterable<string>) => {
  for (const key of Array.from(keys)) {
    if (!obj[key]) {
      return false
    }
  }
  return true
}
