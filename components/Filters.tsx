import { useState } from 'react'
import { AugmentedInfo } from '../lib/libraries'
import { SortOptions } from '../lib/sorting'
import SingleItemChooser from './SingleItemChooser'

interface FilterState {
  sort: string
  frameworks: Set<string>
  features: Set<string>
  licenses: Set<string>
}

interface FilteredItemsProps {
  items: AugmentedInfo[]
  children: (
    filteredItems: AugmentedInfo[],
    filterBar: React.ReactNode
  ) => React.ReactNode
}

const SortSelector: React.FC<{
  value: string
  onChange: (newValue: string) => void
}> = ({ value, onChange }) => {
  const sortOption = SortOptions.find((s) => s.key === value)
  if (!sortOption) {
    throw new Error(`Unknown sort option ${value}`)
  }
  return (
    <SingleItemChooser
      value={value}
      onChange={onChange}
      items={SortOptions.map((s) => [
        s.key,
        <>
          <div>{s.title}</div>
          {s.byline && <div className="text-gray-600">{s.byline}</div>}
        </>,
      ])}
    >
      Sort by {sortOption.title}
    </SingleItemChooser>
  )
}

const hasKeys = (obj: Object, keys: Iterable<string>) => {
  for (const key of Array.from(keys)) {
    if (!obj.hasOwnProperty(key)) {
      return false
    }
  }
  return true
}

export const FilteredItems: React.FC<FilteredItemsProps> = ({
  items,
  children,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    sort: SortOptions[0].key,
    frameworks: new Set(),
    features: new Set(),
    licenses: new Set(['MIT License']),
  })

  let clone = items.slice() // Shallow copy

  const sortOption = SortOptions.find((s) => s.key === filters.sort)
  if (!sortOption) {
    throw new Error(`Unknown sort option ${filters.sort}`)
  }
  clone.sort(sortOption.fn)

  if (filters.frameworks.size) {
    clone = clone.filter((item) => hasKeys(item.frameworks, filters.frameworks))
  }
  if (filters.features.size) {
    clone = clone.filter((item) => hasKeys(item.features, filters.features))
  }
  if (filters.licenses.size) {
    clone = clone.filter((item) => filters.licenses.has(item.license))
  }

  const filterBar = (
    <div className="text-gray-800">
      <SortSelector
        value={filters.sort}
        onChange={(sort) => {
          setFilters({ ...filters, sort })
        }}
      />
      {clone.length} results
    </div>
  )

  return <>{children(clone, filterBar)}</>
}
