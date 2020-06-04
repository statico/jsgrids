import classnames from 'classnames'
import { useState } from 'react'
import { FeatureName, FeatureNames, Features } from '../lib/features'
import {
  FrameworkIcons,
  FrameworkNames,
  FrameworkTitles,
} from '../lib/frameworks'
import { AugmentedInfo, FrameworkName } from '../lib/libraries'
import { SortOptionKey, SortOptions } from '../lib/sorting'
import MultiItemPicker from './MultiItemPicker'
import SingleItemPicker from './SingleItemPicker'
import { hasKeys } from '../lib/utils'

interface FilterState {
  sort: SortOptionKey
  framework: FrameworkName | null
  features: Set<FeatureName>
  license: string | null
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
        return (
          <Icon
            key={name}
            style={{ width: 35, height: 35 }}
            title={title}
            className={classnames(
              'm-1 p-1 rounded-md cursor-pointer',
              selected === name ? 'bg-gray-600 text-gray-200' : 'bg-transparent'
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
      {selected.size ? `${selected.size} Features` : 'Any Feature'}
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
      {selected || 'Any License'}
    </SingleItemPicker>
  )
}

const SortSelector: React.FC<{
  selected: SortOptionKey
  onChange: (newSelected: SortOptionKey) => void
}> = ({ selected, onChange }) => {
  const selectedOption = SortOptions.find((s) => s.key === selected)
  return (
    <SingleItemPicker
      selected={selected}
      onChange={onChange}
      options={SortOptions}
      allowNull={false}
    >
      Sort by {selectedOption.title}
    </SingleItemPicker>
  )
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
    sort: SortOptions[0].key,
    framework: null,
    features: new Set(),
    license: null,
  })

  let clone = items.slice() // Shallow copy

  const sortOption = SortOptions.find((s) => s.key === filters.sort)
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
        selected={filters.sort}
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
