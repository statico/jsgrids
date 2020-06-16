import classnames from 'classnames'
import { useState } from 'react'
import { FeatureName, FeatureNames, Features } from '../lib/features'
import {
  FrameworkIcons,
  FrameworkNames,
  FrameworkTitles,
} from '../lib/frameworks'
import { LibraryInfo, FrameworkName } from '../lib/libraries'
import { SortOptionKey, SortOptions } from '../lib/sorting'
import MultiItemPicker from './MultiItemPicker'
import SingleItemPicker from './SingleItemPicker'
import { hasAllKeys } from '../lib/utils'
import Tooltip from './Tooltip'

interface FilterState {
  sort: SortOptionKey
  framework: FrameworkName | null
  features: Set<FeatureName>
  license: string | null
}

const FrameworkSelector: React.FC<{
  selected: FrameworkName
  onChange: (newSelected: FrameworkName) => void
  className?: string
}> = ({ selected, onChange, className }) => {
  const handleToggle = (name: FrameworkName) => () => {
    onChange(selected === name ? null : name)
  }
  return (
    <div className={classnames('flex flex-row items-center', className)}>
      <span className="mr-2">
        <span className="hidden xl:inline">Frameworks:</span>
        <span className="inline xl:hidden">Show:</span>
      </span>
      {FrameworkNames.map((name) => {
        const Icon = FrameworkIcons[name]
        const title = FrameworkTitles[name]
        return (
          <Tooltip key={name} tip={title}>
            <button
              className={classnames(
                'p-1 rounded-md cursor-pointer hover:opacity-75',
                'transition-opacity duration-75',
                selected === name ? 'bg-gray-400' : 'bg-transparent'
              )}
              onClick={handleToggle(name)}
            >
              <Icon style={{ width: 32, height: 32 }} />
            </button>
          </Tooltip>
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
      <span className="hidden xl:inline">
        {selected.size ? `${selected.size} Features` : 'Any Feature'}
      </span>
      <span className="inline xl:hidden">Features</span>
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
        }))}
    >
      <span className="hidden xl:inline">{selected || 'Any License'}</span>
      <span className="inline xl:hidden">License</span>
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
      <span className="hidden xl:inline">Sort by {selectedOption.title}</span>
      <span className="inline xl:hidden">Sort</span>
    </SingleItemPicker>
  )
}

interface FilteredItemsProps {
  items: LibraryInfo[]
  children: (
    filteredItems: LibraryInfo[],
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
    clone = clone.filter((item) => hasAllKeys(item.features, filters.features))
  }
  if (filters.license) {
    clone = clone.filter((item) => item.license === filters.license)
  }

  const Separator = () => <div className="mx-2" />

  const filterBar = (
    <nav
      className={classnames(
        'text-gray-800 px-4 select-none',
        'flex flex-row flex-wrap lg:flex-no-wrap items-center justify-center'
      )}
    >
      <FrameworkSelector
        className="w-full lg:w-auto justify-center mb-2 lg:mb-0"
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
      <div className="px-2 hidden xl:inline">{clone.length} results</div>
    </nav>
  )

  return <>{children(clone, filterBar)}</>
}
