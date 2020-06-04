import React from 'react'
import { GoChevronDown } from 'react-icons/go'
import Button from './Button'
import Dropdown from './Dropdown'
import FilterBarButton from './FilterBarButton'

interface Option {
  key: string
  title: string
  description: string
}

interface Props {
  selected: Set<string>
  options: Option[]
  onChange: (newValue: Set<string>) => void
}

export const MultiItemPicker: React.FC<Props> = ({
  children,
  selected,
  options,
  onChange,
}) => (
  <Dropdown
    button={
      <FilterBarButton>
        {children}
        <GoChevronDown className="ml-1" />
      </FilterBarButton>
    }
  >
    <div className="block w-full p-3 text-sm whitespace-no-wrap">
      <div className="mb-3">Choose one or more features:</div>
      <div className="grid grid-cols-2 row-gap-0 col-gap-3 mb-3">
        {options.map(({ key, title, description }) => (
          <label
            key={key}
            title={description}
            className="cursor-pointer hover:bg-gray-100 px-1 py-1 rounded-sm"
          >
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
            />
            {title}
          </label>
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
    </div>
  </Dropdown>
)

export default MultiItemPicker
