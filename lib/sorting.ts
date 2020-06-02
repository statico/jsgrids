import { AugmentedInfo } from './libraries'

interface SortOption {
  key: string
  title: string
  byline?: string
  fn: (a: AugmentedInfo, b: AugmentedInfo) => number
}

export const SortOptions: SortOption[] = [
  {
    key: 'popularity',
    title: 'Popularity',
    byline: 'GitHub stars + NPM downloads',
    fn: (a, b) => {
      const av = (a.github?.stars || 0) + (a.npm?.downloads || 0)
      const bv = (b.github?.stars || 0) + (b.npm?.downloads || 0)
      return bv - av
    },
  },
  {
    key: 'stars',
    title: 'GitHub Stars',
    fn: (a, b) => b.github?.stars - a.github?.stars,
  },
  {
    key: 'downloads',
    title: 'NPM Weekly Downloads',
    fn: (a, b) => b.npm?.downloads - a.npm?.downloads,
  },
]
