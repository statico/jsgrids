import React from 'react'
import { GoChevronDown } from 'react-icons/go'
import Dropdown from './Dropdown'
import FilterBarButton from './FilterBarButton'

interface MenuItem {
  name: string
  title: string
  byline?: string
}

interface Props {
  items: MenuItem[]
  onChange: (newValue: string) => void
}

export const SingleItemMenu: React.FC<Props> = ({
  children,
  items,
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
    {items.map(({ name, title, byline }) => (
      <div
        key={name}
        className="block w-full px-4 py-3 text-sm whitespace-no-wrap bg-transparent hover:bg-gray-200 cursor-pointer select-none"
        onClick={() => {
          onChange(name)
        }}
      >
        <div>{title}</div>
        {byline && <div className="text-gray-600">{byline}</div>}
      </div>
    ))}
  </Dropdown>
)

export default SingleItemMenu
