import React from 'react'
import { GoChevronDown } from 'react-icons/go'
import Dropdown from './Dropdown'
import FilterBarButton from './FilterBarButton'

interface Option {
  key: string
  title: string
  description?: string
}

export const SingleItemPicker: React.FC<{
  selected: string | null
  options: Option[]
  allowNull?: boolean
  onChange: (newValue: string) => void
}> = ({ children, selected, options, onChange, allowNull = true }) => (
  <Dropdown
    button={
      <FilterBarButton>
        {children}
        <GoChevronDown className="ml-1" />
      </FilterBarButton>
    }
  >
    <fieldset
      className="block w-full px-4 py-3 text-sm whitespace-no-wrap grid grid-cols-1 row-gap-2 md:row-gap-1"
      role="menu"
    >
      {allowNull && (
        <label className="cursor-pointer hover:bg-gray-100 px-1 py-1 rounded-sm">
          <input
            type="radio"
            className="align-middle mb-1 mr-3"
            checked={!selected}
            onChange={() => {
              onChange(null)
            }}
            role="menuitem"
            tabIndex={-1}
          />
          Any License
        </label>
      )}
      {options.map(({ key, title, description }) => (
        <label key={key} className="cursor-pointer hover:opacity-75 px-1 py-1">
          <input
            type="radio"
            className="align-middle mb-1 mr-3"
            checked={selected === key}
            onChange={() => {
              onChange(key)
            }}
            role="menuitem"
            tabIndex={-1}
          />
          {title}
          {description && (
            <div className="text-xs text-gray-700 dark:text-gray-500 ml-6">
              {description}
            </div>
          )}
        </label>
      ))}
    </fieldset>
  </Dropdown>
)

export default SingleItemPicker
