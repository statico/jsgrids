import { createPopper } from '@popperjs/core'
import classnames from 'classnames'
import React, { createRef, useCallback, useState } from 'react'
import { GoChevronDown } from 'react-icons/go'
import Dropdown from './Dropdown'
import FilterBarButton from './FilterBarButton'

interface Option {
  key: string
  title: string
  description: string
}

interface Props {
  selected: string | null
  options: Option[]
  onChange: (newValue: string) => void
}

export const SingleItemPicker: React.FC<Props> = ({
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
    <div className="block w-full px-4 py-3 text-sm whitespace-no-wrap grid grid-cols-1 row-gap-1">
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
      {options.map(({ key, title, description }) => (
        <label
          key={key}
          title={description}
          className="cursor-pointer hover:bg-gray-100 px-1 py-1"
        >
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
      ))}
    </div>
  </Dropdown>
)

export default SingleItemPicker
