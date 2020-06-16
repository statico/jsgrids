import React from 'react'
import { GoChevronDown } from 'react-icons/go'
import Button from './Button'
import Dropdown from './Dropdown'
import FilterBarButton from './FilterBarButton'
import Tooltip from './Tooltip'

interface Option {
  key: string
  title: string
  description: string
}

export const MultiItemPicker: React.FC<{
  selected: Set<string>
  options: Option[]
  onChange: (newValue: Set<string>) => void
}> = ({ children, selected, options, onChange }) => (
  <Dropdown
    button={
      <FilterBarButton>
        {children}
        <GoChevronDown className="ml-1" />
      </FilterBarButton>
    }
  >
    <fieldset
      className="block w-full p-3 text-sm whitespace-no-wrap"
      role="menu"
    >
      <div className="mb-3">Choose one or more:</div>
      <div className="grid grid-cols-2 row-gap-1 lg:row-gap-0 col-gap-3 mb-3">
        {options.map(({ key, title, description }) => (
          <Tooltip key={key} tip={description}>
            <label className="cursor-pointer hover:opacity-75 px-1 py-1 rounded-sm leading-relaxed">
              <input
                type="checkbox"
                className="align-middle mb-1 mr-2"
                checked={selected.has(key)}
                onChange={(event) => {
                  const newValue = new Set(selected)
                  if (event.target.checked) {
                    newValue.add(key)
                  } else {
                    newValue.delete(key)
                  }
                  onChange(newValue)
                }}
                role="menuitem"
                tabIndex={-1}
              />
              {title}
            </label>
          </Tooltip>
        ))}
      </div>
      <Button
        small
        title="Clear All"
        disabled={selected.size === 0}
        onClick={() => {
          onChange(new Set())
        }}
      />
    </fieldset>
  </Dropdown>
)

export default MultiItemPicker
