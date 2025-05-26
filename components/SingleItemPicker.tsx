import React, { ReactNode, useState, useRef, useEffect } from "react";
import { GoCheck, GoChevronDown } from "react-icons/go";

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

export const SingleItemPicker = ({
  children,
  selected,
  options,
  onChange,
  allowNull = true,
}: SingleItemPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 font-normal"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{children}</span>
        <GoChevronDown />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-48 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
          {allowNull && (
            <button
              className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
            >
              {!selected ? <GoCheck className="w-4 h-4" /> : <BlankIcon />}
              <span>Any</span>
            </button>
          )}
          {options.map(({ key, title, description }) => (
            <button
              key={key}
              className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => {
                onChange(key);
                setIsOpen(false);
              }}
            >
              {selected === key ? (
                <GoCheck className="w-4 h-4" />
              ) : (
                <BlankIcon />
              )}
              <div>
                <div>{title}</div>
                {description && (
                  <div className="text-xs text-gray-500">{description}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SingleItemPicker;
