import React, { ReactNode, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// We use "T extends string" instead of string because we want to be able to
// limit the strings that can be used as keys, such as with FeatureName.

type Option<T extends string> = {
  key: T;
  title: string;
  description: string;
};

type MultiItemPickerProps<T extends string> = {
  children: ReactNode;
  selected: Set<T>;
  options: Option<T>[];
  onChange: (newValue: Set<T>) => void;
};

export const MultiItemPicker = <T extends string>({
  children,
  selected,
  options,
  onChange,
}: MultiItemPickerProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center space-x-2 font-normal"
        >
          <span>{children}</span>
          <GoChevronDown />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-3">
        <div className="space-y-3">
          <div className="text-sm font-medium">Choose one or more:</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 max-h-64 overflow-y-auto">
            {options.map(({ key, title, description }) => (
              <label
                key={key}
                className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground p-1 rounded"
              >
                <Checkbox
                  checked={selected.has(key)}
                  onCheckedChange={(checked) => {
                    const newValue = new Set(selected);
                    if (checked) {
                      newValue.add(key);
                    } else {
                      newValue.delete(key);
                    }
                    onChange(newValue);
                  }}
                />
                <span className="text-xs">{title}</span>
              </label>
            ))}
          </div>
          <Button
            variant="secondary"
            disabled={selected.size === 0}
            onClick={() => {
              onChange(new Set());
            }}
            className="w-full"
          >
            Reset
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MultiItemPicker;
