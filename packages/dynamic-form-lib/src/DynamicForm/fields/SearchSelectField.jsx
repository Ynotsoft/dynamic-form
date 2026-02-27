import React, { useState, useCallback, useRef, useEffect } from "react";
import { X, ChevronDown, Search, Loader2, Check } from "lucide-react";

function SearchSelectField({
  field,
  formValues,
  handleChange,
  handleBlur,
  error,
  disabled,
  apiClient,
}) {
  const isDisabled = disabled || (field.disabled && (typeof field.disabled === "function" ? field.disabled(formValues) : field.disabled));
  const isSingleSelect = field.selectMode !== "multiple";

  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // Cache allows us to keep labels specific to selected IDs even if they aren't in the current search results
  const [selectedOptionsCache, setSelectedOptionsCache] = useState({});

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // --- VALUE HANDLING ---
  const currentRawValue = formValues[field.name];

  const getSelectedItems = () => {
    if (currentRawValue === null || currentRawValue === undefined || currentRawValue === "") return [];

    // Ensure we handle both single value and array
    const values = Array.isArray(currentRawValue) ? currentRawValue : [currentRawValue];

    return values.map(val => {
      // 1. Try to find in current loaded options
      const foundInOptions = options.find(o => o.value === val);
      if (foundInOptions) return foundInOptions;

      // 2. Try to find in cache
      if (selectedOptionsCache[val]) return selectedOptionsCache[val];

      // 3. Fallback
      return { value: val, label: val };
    });
  };

  const selectedItems = getSelectedItems();

  // --- DATA FETCHING ---
  const loadOptions = useCallback(
    async (inputValue = "") => {
      // Allow custom onSearch if strictly needed, but prioritize optionsUrl per request
      if (field.onSearch && typeof field.onSearch === "function") {
        const results = await field.onSearch(inputValue, formValues);
        setOptions(results);
        return;
      }

      if (!field.optionsUrl || !apiClient) return;

      setIsLoading(true);
      try {
        const searchParam = field.searchParam || "search";
        const separator = field.optionsUrl.includes("?") ? "&" : "?";
        // Implementation for: "url?search=term"
        const url = `${field.optionsUrl}${separator}${searchParam}=${encodeURIComponent(inputValue)}`;

        const response = await apiClient(url);

        // Handle various response shapes
        const data = response.data || response;
        const results = Array.isArray(data) ? data : [];

        // Map to {value, label}
        const mappedResults = results.map(item => ({
          value: item[field.valueId || "value"] || item.value || item.id,
          label: item[field.labelId || "label"] || item.label || item.name
        }));

        setOptions(mappedResults);
      } catch (err) {
        console.error("Search failed:", err);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [field, apiClient, formValues]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => loadOptions(value), 300);
  };

  useEffect(() => {
    if (isOpen) {
      if (options.length === 0) loadOptions("");
      // Little delay to allow render before focus
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        handleBlur(field.name);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [field.name, handleBlur]);

  const handleSelect = (option) => {
    setSelectedOptionsCache(prev => ({ ...prev, [option.value]: option }));

    let newRawValue;
    if (isSingleSelect) {
      newRawValue = option.value;
      setIsOpen(false);
    } else {
      const currentArray = Array.isArray(currentRawValue) ? currentRawValue : [];
      const exists = currentArray.includes(option.value);
      newRawValue = exists
        ? currentArray.filter(v => v !== option.value)
        : [...currentArray, option.value];
    }

    handleChange(field.name, newRawValue);
    if (field.clearSearchOnSelect) setSearchTerm("");
  };

  const handleRemove = (e, valueToRemove) => {
    e.stopPropagation();
    if (isSingleSelect) {
      handleChange(field.name, null);
    } else {
      const currentArray = Array.isArray(currentRawValue) ? currentRawValue : [];
      handleChange(field.name, currentArray.filter(v => v !== valueToRemove));
    }
  };

  return (
    <div className={`mb-4 relative ${field.fieldClass || "col-span-full"}`} ref={dropdownRef}>
      {/* Trigger */}
      <div
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        className={`
          w-full min-h-[42px] px-3 py-2 border rounded-lg bg-white cursor-pointer
          flex items-center flex-wrap gap-2
          ${error ? "border-red-500" : "border-gray-300 hover:border-gray-400"}
          ${isOpen ? "ring-2 ring-blue-100 border-blue-500" : ""}
          ${isDisabled ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""}
        `}
      >
        {selectedItems.length > 0 ? (
          selectedItems.map((item) => (
            <span key={item.value} className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded-md border border-blue-100">
              {item.label}
              {!isDisabled && (
                <button type="button" onClick={(e) => handleRemove(e, item.value)} className="ml-1 p-0.5 hover:bg-blue-200 rounded-full">
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">{field.placeholder || "Select..."}</span>
        )}
        <div className="ml-auto flex items-center">
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-gray-400" />}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !isDisabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Type to search..."
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {options.length > 0 ? (
              options.map((option) => {
                const isSelected = selectedItems.some(i => i.value === option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={`px-3 py-2 text-sm rounded cursor-pointer flex items-center justify-between ${isSelected ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100 text-gray-700"}`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                );
              })
            ) : (
              <div className="py-4 text-center text-sm text-gray-500">{isLoading ? "Loading..." : "No results found"}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default SearchSelectField;
