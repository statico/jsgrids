import { createPopper } from '@popperjs/core'
import classnames from 'classnames'
import React, { createRef, useCallback, useState } from 'react'
import { GoChevronDown } from 'react-icons/go'
import Dropdown from './Dropdown'
import FilterBarButton from './FilterBarButton'
import Tooltip from './Tooltip'

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
    <div className="block w-full px-4 py-3 text-sm whitespace-no-wrap grid grid-cols-1 row-gap-2 md:row-gap-1">
      {allowNull && (
        <label className="cursor-pointer hover:bg-gray-100 px-1 py-1 rounded-sm">
          <input
            type="radio"
            className="align-middle mb-1 mr-2"
            checked={!selected}
            onChange={() => {
              onChange(null)
            }}
          />
          Any License
        </label>
      )}
      {options.map(({ key, title, description }) => (
        <Tooltip tip={description} key={key}>
          <label className="cursor-pointer hover:bg-gray-100 px-1 py-1">
            <input
              type="radio"
              className="align-middle mb-1 mr-2"
              checked={selected === key}
              onChange={() => {
                onChange(key)
              }}
            />
            {title}
          </label>
        </Tooltip>
      ))}
    </div>
  </Dropdown>
)

export default SingleItemPicker
