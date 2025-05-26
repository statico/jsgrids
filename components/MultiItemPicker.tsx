import React, { ReactNode, useState, useRef, useEffect } from "react";
import { GoChevronDown } from "react-icons/go";

// We use "T extends string" instead of string because we want to be able to
// limit the strings that can be used as keys, such as with FeatureName.

type Option<T extends string> = {
  key: T;
  title: string;
  description: string;
};

// Simple Tooltip component
const Tooltip = ({
  children,
  title,
  className = "",
}: {
  children: React.ReactNode;
  title: string;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-10 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap max-w-xs">
          {title}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
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
        <div className="absolute z-10 mt-1 w-80 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-3">
          <div className="space-y-3">
            <div className="text-sm font-medium">Choose one or more:</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 max-h-64 overflow-y-auto">
              {options.map(({ key, title, description }) => (
                <Tooltip key={key} title={description}>
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selected.has(key)}
                      onChange={(event) => {
                        const newValue = new Set(selected);
                        if (event.target.checked) {
                          newValue.add(key);
                        } else {
                          newValue.delete(key);
                        }
                        onChange(newValue);
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm">{title}</span>
                  </label>
                </Tooltip>
              ))}
            </div>
            <button
              disabled={selected.size === 0}
              onClick={() => {
                onChange(new Set());
              }}
              className="w-full px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 rounded"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiItemPicker;
