import { useState } from 'react'
import { AugmentedInfo, FrameworkName } from '../lib/libraries'
import { SortOptions, SortOptionName } from '../lib/sorting'
import SingleItemMenu from './SingleItemMenu'
import {
  FrameworkNames,
  FrameworkIcons,
  FrameworkTitles,
} from '../lib/frameworks'
import classNames from 'classnames'
import { FeatureName, FeatureNames, Features } from '../lib/features'
import MultiItemPicker from './MultiItemPicker'
import SingleItemPicker from './SingleItemPicker'

interface FilterState {
  sort: SortOptionName
  framework: FrameworkName | null
  features: Set<FeatureName>
  license: string | null
}

const SortSelector: React.FC<{
  value: SortOptionName
  onChange: (newSelected: SortOptionName) => void
}> = ({ value, onChange }) => {
  const sortOption = SortOptions.find((s) => s.name === value)
  return (
    <SingleItemMenu
      value={value}
      onChange={onChange}
      items={SortOptions.map((s) => [
        s.name,
        <>
          <div>{s.title}</div>
          {s.byline && <div className="text-gray-600">{s.byline}</div>}
        </>,
      ])}
    >
      Sort by {sortOption.title}
    </SingleItemMenu>
  )
}

const FrameworkSelector: React.FC<{
  selected: FrameworkName
  onChange: (newSelected: FrameworkName) => void
}> = ({ selected, onChange }) => {
  const handleToggle = (name: FrameworkName) => () => {
    onChange(selected === name ? null : name)
  }
  return (
    <div className="flex flex-row items-center">
      <span className="mr-2">Frameworks:</span>
      {FrameworkNames.map((name) => {
        const Icon = FrameworkIcons[name]
        const title = FrameworkTitles[name]
        const color =
          selected === name
            ? 'bg-blue-400 active:transparent'
            : 'bg-transparent active:bg-blue-400'
        return (
          <Icon
            key={name}
            style={{ width: 40, height: 40 }}
            title={title}
            className={classNames(
              'text-gray-800 opacity-100 hover:opacity-75',
              'm-1 p-1 rounded-md transition-opacity duration-100 cursor-pointer',
              color
            )}
            onClick={handleToggle(name)}
          />
        )
      })}
    </div>
  )
}

const FeaturesSelector: React.FC<{
  selected: Set<FeatureName>
  onChange: (newSelected: Set<FeatureName>) => void
}> = ({ selected, onChange }) => {
  return (
    <MultiItemPicker
      selected={selected}
      onChange={onChange}
      options={FeatureNames.map((name) => ({
        key: name,
        title: Features[name].title,
        description: Features[name].description,
      }))}
    >
      {selected.size || ''} Features
    </MultiItemPicker>
  )
}

const LicenseSelector: React.FC<{
  licenses: Set<string>
  selected: string | null
  onChange: (newSelected: string) => void
}> = ({ licenses, selected, onChange }) => {
  return (
    <SingleItemPicker
      selected={selected}
      onChange={onChange}
      options={Array.from(licenses)
        .sort()
        .map((name) => ({
          key: name,
          title: name,
          description: "See the project's home page for license details.",
        }))}
    >
      {selected || 'License'}
    </SingleItemPicker>
  )
}

const hasKeys = (obj: Object, keys: Iterable<string>) => {
  for (const key of Array.from(keys)) {
    if (!obj[key]) {
      return false
    }
  }
  return true
}

interface FilteredItemsProps {
  items: AugmentedInfo[]
  children: (
    filteredItems: AugmentedInfo[],
    filterBar: React.ReactNode
  ) => React.ReactNode
}

export const FilteredItems: React.FC<FilteredItemsProps> = ({
  items,
  children,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    sort: SortOptions[0].name,
    framework: null,
    features: new Set(),
    license: null,
  })

  let clone = items.slice() // Shallow copy

  const sortOption = SortOptions.find((s) => s.name === filters.sort)
  if (!sortOption) {
    throw new Error(`Unknown sort option ${filters.sort}`)
  }
  clone.sort(sortOption.fn)

  if (filters.framework) {
    clone = clone.filter((item) => item.frameworks[filters.framework])
  }
  if (filters.features.size) {
    clone = clone.filter((item) => hasKeys(item.features, filters.features))
  }
  if (filters.license) {
    clone = clone.filter((item) => item.license === filters.license)
  }

  const Separator = () => <div className="mx-2" />

  const filterBar = (
    <div className="text-gray-800 flex flex-row items-center select-none">
      <FrameworkSelector
        selected={filters.framework}
        onChange={(framework) => {
          setFilters({ ...filters, framework })
        }}
      />
      <Separator />
      <FeaturesSelector
        selected={filters.features}
        onChange={(features) => {
          setFilters({ ...filters, features })
        }}
      />
      <Separator />
      <LicenseSelector
        licenses={new Set(items.map((i) => i.license))}
        selected={filters.license}
        onChange={(license) => {
          setFilters({ ...filters, license })
        }}
      />
      <Separator />
      <SortSelector
        value={filters.sort}
        onChange={(sort) => {
          setFilters({ ...filters, sort })
        }}
      />
      <Separator />
      <div className="px-2">{clone.length} results</div>
    </div>
  )

  return <>{children(clone, filterBar)}</>
}
