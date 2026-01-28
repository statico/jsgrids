import React, { ReactNode, useState } from "react";
import { GoCheck, GoChevronDown } from "react-icons/go";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Option = {
  key: string;
  title: string;
  description?: string;
};

const BlankIcon = () => <div className="w-4 h-4" />;

type SingleItemPickerProps = {
  children: ReactNode;
  selected: string | null;
  options: Option[];
  allowNull?: boolean;
  onChange: (newValue: any) => void;
};

const SingleItemPicker = ({
  children,
  selected,
  options,
  onChange,
  allowNull = true,
}: SingleItemPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 font-normal"
        >
          <span>{children}</span>
          <GoChevronDown />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0">
        {allowNull && (
          <button
            className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
          >
            {!selected ? <GoCheck className="w-4 h-4" /> : <BlankIcon />}
            <span className="text-xs">Any</span>
          </button>
        )}
        {options.map(({ key, title, description }) => (
          <button
            key={key}
            className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              onChange(key);
              setIsOpen(false);
            }}
          >
            {selected === key ? <GoCheck className="w-4 h-4" /> : <BlankIcon />}
            <div>
              <div className="text-xs">{title}</div>
              {description && (
                <div className="text-xs text-muted-foreground">
                  {description}
                </div>
              )}
            </div>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default SingleItemPicker;
