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
} from "@chakra-ui/react";
import React, { ReactNode } from "react";
import { GoChevronDown } from "react-icons/go";

// We use "T extends string" instead of string because we want to be able to
// limit the strings that can be used as keys, such as with FeatureName.

interface Option<T extends string> {
  key: T;
  title: string;
  description: string;
}

interface MultiItemPickerProps<T extends string> {
  children: ReactNode;
  selected: Set<T>;
  options: Option<T>[];
  onChange: (newValue: Set<T>) => void;
}

export const MultiItemPicker = <T extends string>({
  children,
  selected,
  options,
  onChange,
}: MultiItemPickerProps<T>) => {
  return (
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
                  isChecked={selected.has(key)}
                  onChange={(event) => {
                    const newValue = new Set(selected);
                    if (event.target.checked) {
                      newValue.add(key);
                    } else {
                      newValue.delete(key);
                    }
                    onChange(newValue);
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
              onChange(new Set());
            }}
          >
            Reset
          </Button>
        </Stack>
      </MenuList>
    </Menu>
  );
};

export default MultiItemPicker;
