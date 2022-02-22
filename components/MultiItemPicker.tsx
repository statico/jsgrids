import {
  Button,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import React from "react"
import { GoChevronDown } from "react-icons/go"

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
  <Menu>
    <MenuButton as={Button} rightIcon={<GoChevronDown />} fontWeight="normal">
      {children}
    </MenuButton>
    <MenuList p={3}>
      <Stack>
        <Text>Choose one or more:</Text>
        <SimpleGrid columns={2} spacingX={3} spacingY={1}>
          {options.map(({ key, title, description }) => (
            <Tooltip key={key} title={description}>
              <Checkbox
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
              >
                {title}
              </Checkbox>
            </Tooltip>
          ))}
        </SimpleGrid>
        <Button
          disabled={selected.size === 0}
          onClick={() => {
            onChange(new Set())
          }}
        >
          Reset
        </Button>
      </Stack>
    </MenuList>
  </Menu>
)

export default MultiItemPicker
