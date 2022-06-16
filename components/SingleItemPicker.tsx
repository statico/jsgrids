import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react"
import React, { ReactNode } from "react"
import { GoCheck, GoChevronDown } from "react-icons/go"

interface Option {
  key: string
  title: string
  description?: string
}

const BlankIcon = () => <Box boxSize="1em" />

interface Props {
  children: ReactNode
  selected: string | null
  options: Option[]
  allowNull?: boolean
  onChange: (newValue: any) => void
}

export const SingleItemPicker = ({
  children,
  selected,
  options,
  onChange,
  allowNull = true,
}: Props) => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<GoChevronDown />} fontWeight="normal">
        {children}
      </MenuButton>
      <MenuList>
        {allowNull && (
          <MenuItem
            icon={!selected ? <GoCheck /> : <BlankIcon />}
            aria-selected={!selected}
            onClick={() => {
              onChange(null)
            }}
          >
            Any
          </MenuItem>
        )}
        {options.map(({ key, title, description }) => (
          <MenuItem
            key={key}
            icon={selected === key ? <GoCheck /> : <BlankIcon />}
            aria-selected={selected === key}
            onClick={() => {
              onChange(key)
            }}
          >
            {title}
            {description ? <Text size="xs">{description}</Text> : false}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}

export default SingleItemPicker
