import { AugmentedInfo } from './libraries'

export interface SortOption {
  name: 'popularity' | 'stars' | 'downloads'
  title: string
  byline?: string
  fn: (a: AugmentedInfo, b: AugmentedInfo) => number
}

export type SortOptionName = SortOption['name']

export const SortOptions: SortOption[] = [
  {
    name: 'popularity',
    title: 'Popularity',
    byline: 'GitHub stars + NPM downloads',
    fn: (a, b) => {
      const av = (a.github?.stars || 0) + (a.npm?.downloads || 0)
      const bv = (b.github?.stars || 0) + (b.npm?.downloads || 0)
      return bv - av
    },
  },
  {
    name: 'stars',
    title: 'GitHub Stars',
    fn: (a, b) => b.github?.stars - a.github?.stars,
  },
  {
    name: 'downloads',
    title: 'NPM Weekly Downloads',
    fn: (a, b) => b.npm?.downloads - a.npm?.downloads,
  },
]
