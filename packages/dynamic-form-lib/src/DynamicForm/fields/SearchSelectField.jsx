import { useState, useCallback, useRef, useEffect } from "react";
import { X, ChevronDown, Search, Loader2, Check } from "lucide-react";

function SearchSelectField({
  field,
  formValues,
  handleChange,
  handleBlur,
  error,
  disabled,
  apiClient,
  ...props
}) {
  const isDisabled = disabled;
  const isSingleSelect = field.selectMode !== "multiple";
  const returnValueOnly =
    field.returnValueOnly === true;

  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedOptionsCache, setSelectedOptionsCache] = useState({});

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const currentRawValue = formValues[field.name];

  const getSelectedItems = useCallback(() => {
    if (!currentRawValue) return [];
    const values = Array.isArray(currentRawValue)
      ? currentRawValue
      : [currentRawValue];
    return values.map((val) => {
      // Direct object mapping formatting if passed during load
      if (val && typeof val === 'object' && val.value !== undefined) {
        return { value: val.value, label: val.label || val.value };
      }
      const foundInOptions = options.find((o) => o.value === val);
      if (foundInOptions) return foundInOptions;
      if (selectedOptionsCache[val]) return selectedOptionsCache[val];
      return { value: val, label: val };
    });
  }, [currentRawValue, options, selectedOptionsCache]);

  const selectedItems = getSelectedItems();

  const loadOptions = useCallback(
    async (inputValue = "") => {
      if (field.onSearch) {
        const results = await field.onSearch(inputValue, formValues);
        setOptions(results);
        return;
      }
      if (!field.optionsUrl || !apiClient) {
        const allOptions = (field.options || []).map((item) => ({
          value: item[field.valueId || "value"] || item.value || item.id,
          label: item[field.labelId || "label"] || item.label || item.name,
        }));
        setOptions(
          !inputValue
            ? allOptions
            : allOptions.filter((opt) =>
              String(opt.label)
                .toLowerCase()
                .includes(inputValue.toLowerCase()),
            ),
        );
        return;
      }

      setIsLoading(true);
      try {
        const searchParam = field.searchParam || "search";
        const separator = field.optionsUrl.includes("?") ? "&" : "?";
        const url = `${field.optionsUrl}${separator}${searchParam}=${encodeURIComponent(inputValue)}`;
        const response = await apiClient(url);
        const data = response.data || response;
        const results = Array.isArray(data) ? data : [];
        setOptions(
          results.map((item) => ({
            value: item[field.valueId || "value"] || item.value || item.id,
            label: item[field.labelId || "label"] || item.label || item.name,
          })),
        );
      } catch (err) {
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [field, apiClient, formValues],
  );

  const handleSelect = useCallback(
    (option) => {
      if (!option) return;
      setSelectedOptionsCache((prev) => ({ ...prev, [option.value]: option }));

      const optionToSave = returnValueOnly
        ? option.value
        : { value: option.value, label: option.label };
      let newRawValue;
      if (isSingleSelect) {
        newRawValue = [optionToSave];
        setIsOpen(false);
      } else {
        const currentArray = Array.isArray(currentRawValue)
          ? currentRawValue
          : [];

        const exists = currentArray.some(v => (v?.value ?? v) === option.value);
        newRawValue = exists
          ? currentArray.filter((v) => (v?.value ?? v) !== option.value)
          : [...currentArray, optionToSave];
      }
      handleChange(field.name, newRawValue);

      // --- FIX: Trigger blur to clear validation errors ---
      handleBlur(field.name);

      if (field.clearSearchOnSelect) setSearchTerm("");
    },
    [
      currentRawValue,
      field.clearSearchOnSelect,
      field.name,
      handleChange,
      handleBlur,
      isSingleSelect,
      returnValueOnly,
    ],
  );

  const handleKeyDown = (e) => {
    if (isDisabled) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setActiveIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : prev,
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
        }
        break;
      case "Enter":
        e.preventDefault();
        if (isOpen && activeIndex >= 0 && options[activeIndex]) {
          handleSelect(options[activeIndex]);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        handleBlur(field.name);
        break;
      default:
        break;
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setActiveIndex(-1);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => loadOptions(value), 300);
  };

  useEffect(() => {
    if (isOpen) {
      loadOptions(searchTerm);
      const timer = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    } else {
      setActiveIndex(-1);
    }
  }, [isOpen, loadOptions, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        handleBlur(field.name);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [field.name, handleBlur]);

  const handleRemove = (e, valueToRemove) => {
    e.stopPropagation();
    const currentArray = Array.isArray(currentRawValue) ? currentRawValue : [];
    const newValue = isSingleSelect
      ? []
      : currentArray.filter((v) => (v?.value ?? v) !== valueToRemove);
    handleChange(field.name, newValue);

    // --- FIX: Trigger blur after removal ---
    handleBlur(field.name);
  };

  return (
    <div
      className={`mb-4 relative ${field.fieldClass || "col-span-full"}`}
      ref={dropdownRef}
    >
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${field.name}-listbox`}
        tabIndex={isDisabled ? -1 : 0}
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`
					w-full min-h-10 px-2 py-1 border rounded-lg bg-background cursor-pointer
					flex items-center flex-wrap gap-2 transition-all outline-none
					${error ? "border-destructive ring-1 ring-destructive" : "border-input hover:border-accent-foreground/20"}
					${isOpen ? "ring-2 ring-ring border-primary" : "focus-visible:ring-2 focus-visible:ring-ring"}
					${isDisabled ? "bg-muted opacity-60 cursor-not-allowed" : ""}
				`}
      >
        {selectedItems.length > 0 ? (
          selectedItems.map((item) => (
            <span
              key={item.value}
              className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-sm border border-primary/20"
            >
              {item.label}
              {!isDisabled && (
                <button
                  type="button"
                  aria-label={`Remove ${item.label}`}
                  onClick={(e) => handleRemove(e, item.value)}
                  className="ml-1 p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))
        ) : (
          <span className="text-muted-foreground text-sm leading-tight">
            {field.placeholder || "Select..."}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {isOpen && !isDisabled && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border bg-muted/30">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="search"
                aria-autocomplete="list"
                aria-controls={`${field.name}-listbox`}
                aria-activedescendant={
                  activeIndex >= 0
                    ? `${field.name}-opt-${activeIndex}`
                    : undefined
                }
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                className="w-full h-9 pl-9 pr-3 text-sm bg-transparent border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Type to search..."
              />
            </div>
          </div>
          <div
            id={`${field.name}-listbox`}
            role="listbox"
            aria-label={field.label}
            className="max-h-60 overflow-y-auto p-1"
          >
            {options.length > 0 ? (
              options.map((option, index) => {
                const isSelected = selectedItems.some(
                  (i) => i.value === option.value,
                );
                const isActive = index === activeIndex;
                return (
                  <div
                    key={option.value}
                    id={`${field.name}-opt-${index}`}
                    role="option"
                    tabIndex={-1}
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option)}
                    onKeyDown={(e) => e.key === "Enter" && handleSelect(option)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`
											px-3 py-2 text-sm rounded-md cursor-pointer flex items-center justify-between transition-colors outline-none
											${isActive ? "bg-accent text-accent-foreground" : ""}
											${isSelected ? "text-primary font-medium" : "text-foreground"}
											${!isActive && !isSelected ? "hover:bg-muted" : ""}
										`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </div>
                );
              })
            ) : (
              <output className="block py-8 text-center text-sm text-muted-foreground">
                {isLoading ? "Searching..." : "No results found"}
              </output>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchSelectField;
