import React, { useEffect, useRef, useState } from "react";
import { cn } from "../utils";

type Option = {
  value: string;
  label: string;
};

type AutocompleteProps = {
  options: Option[];
  onOptionClick: (option: Option) => void;
  className?: string;
  defaultValue?: string;
};

const Autocomplete: React.FC<AutocompleteProps> = ({ options, onOptionClick, className, defaultValue= "" }) => {
  const [query, setQuery] = useState(defaultValue);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setDropdownVisible(true);
  };

  const handleOptionClick = (option: Option) => {
    setQuery(option.label); // Set the input value to the clicked item's label
    setDropdownVisible(false); // Hide the dropdown
    onOptionClick(option); // Trigger the callback
  };


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(()=>{
    setQuery(defaultValue)
  }, [defaultValue])


  return (
    <div ref={dropdownRef} className="relative w-full max-w-sm">
      {/* Input Field */}
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => setDropdownVisible(true)}
        className={cn(
            'rounded-base bg-white border-2 border-border dark:border-darkBorder  p-[10px] font-base ring-offset-white focus-visible:outline-none  outline-none',
            className,
          )}
        placeholder="Search..."
      />

      {/* Dropdown Menu */}
      {isDropdownVisible && (
        <ul className="absolute left-0 right-0 z-10 mt-2 bg-white border-2 border-border rounded shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                key={`${option.value}-${index}`}
                onClick={() => handleOptionClick(option)}
                className="p-2 cursor-pointer hover:bg-blue-100"
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default Autocomplete;
