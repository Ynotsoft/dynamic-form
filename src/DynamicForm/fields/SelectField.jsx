import * as Select from "@radix-ui/react-select";
import React from "react";
// get arrow down icon from icon hero icon
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function SelectField({ field, formValues, handleChange, handleBlur }) {
  const value = formValues[field.name] || "";
  const isDisabled =
    typeof field.disabled === "function"
      ? field.disabled(formValues)
      : field.disabled;
  const options = field.options || [];

  return (
    <Select.Root
      value={value}
      onValueChange={(val) => handleChange(field.name, val)}
      disabled={isDisabled}
    >
      {/* --- Trigger --- */}
      <Select.Trigger
        id={field.name}
        onBlur={() => handleBlur(field.name)}
        className={`inline-flex items-center justify-between w-full px-3 py-2 border rounded-md text-sm transition-all
          ${isDisabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-blue-500"}
        `}
      >
        <Select.Value
          placeholder={
            field.placeholder || `Select ${field.label?.toLowerCase() || ""}`
          }
        />
        <Select.Icon className="ml-2 text-gray-500">
          <ChevronDownIcon className="w-4 h-4" />
        </Select.Icon>
      </Select.Trigger>

      {/* --- Dropdown --- */}
      <Select.Portal>
        <Select.Content
          className="bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[var(--radix-select-trigger-width)]"
          position="popper"
          sideOffset={5}
        >
          {/* Scroll Up */}
          <Select.ScrollUpButton className="flex items-center justify-center h-6 text-gray-500 bg-gray-50">
            <Select.Arrow className="fill-white stroke-gray-200" />
          </Select.ScrollUpButton>

          <Select.Viewport className="p-1">
            {/* Optional grouped items */}
            {field.groupLabel && (
              <Select.Group>
                <Select.Label className="px-2 py-1 text-xs text-gray-500 uppercase tracking-wide">
                  {field.groupLabel}
                </Select.Label>
              </Select.Group>
            )}

            {/* List of options */}
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className={`relative flex items-center px-3 py-2 text-sm rounded cursor-pointer select-none
                  data-[state=checked]:bg-blue-50
                  data-[state=checked]:text-blue-600
                `}
              >
                <Select.ItemText>{option.label}</Select.ItemText>

              </Select.Item>
            ))}

            {/* Optional separator */}
            {field.separator && (
              <Select.Separator className="my-1 h-px bg-gray-200" />
            )}
          </Select.Viewport>

          {/* Scroll Down */}

          {/* Optional arrow */}
          <Select.Arrow className="fill-white stroke-gray-200" />
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export default SelectField;
