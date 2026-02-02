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
	const fieldDisabled =
		field.disabled && typeof field.disabled === "function"
			? field.disabled(formValues)
			: field.disabled;

	const isDisabled = disabled || fieldDisabled;

	// Layout mode: 'inline' (default) or 'dialog' (modal)
	const layoutMode = field.layout || "inline";
	const isDialogMode = layoutMode === "dialog";
	const isSingleSelect = field.selectMode === "single";

	const [options, setOptions] = useState(field.options || []);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchError, setSearchError] = useState(null);
	const [selectedOptionsCache, setSelectedOptionsCache] = useState({}); // Cache for selected option labels
	const debounceTimerRef = useRef(null);
	const dropdownRef = useRef(null);
	const searchInputRef = useRef(null);

	// --- VALUE NORMALIZATION LOGIC ---

	// Get current form values - default to empty array (no initial values required)
	const currentValues = formValues[field.name] || [];

	const isArrayOfObjects = (arr) =>
		Array.isArray(arr) &&
		arr.length > 0 &&
		typeof arr[0] === "object" &&
		arr[0] !== null &&
		"value" in arr[0];

	let selectedValues = [];

	// Only process if there are actual values
	if (currentValues && currentValues.length > 0) {
		if (isArrayOfObjects(currentValues)) {
			// Already in correct format
			selectedValues = currentValues;
		} else {
			// Map primitive values to option objects (only if options are available)
			selectedValues = currentValues
				.filter((val) => val !== null && val !== undefined)
				.map((rawValue) => {
					// Try to find in current options first
					const found = options.find((option) => option.value === rawValue);
					// If not found, check the cache
					if (found) return found;
					if (selectedOptionsCache[rawValue])
						return selectedOptionsCache[rawValue];
					// Last resort: create a placeholder object
					return { value: rawValue, label: `Loading... (${rawValue})` };
				})
				.filter((option) => option !== undefined);
		}
	}

	// --- END VALUE NORMALIZATION ---

	// Close dropdown when clicking outside
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

	// --- DYNAMIC SEARCH FUNCTIONALITY ---
	const loadOptions = useCallback(
		async (inputValue) => {
			if (!field.optionsUrl && !field.onSearch) {
				return options;
			}

			// Allow empty search to load all options initially
			const minSearchLength = field.minSearchLength || 0; // Changed default to 0
			if (inputValue.length < minSearchLength && minSearchLength > 0) {
				return options;
			}

			setIsLoading(true);
			setSearchError(null); // Clear previous errors

			try {
				let results = [];

				// Option 1: Custom search function provided in schema
				if (field.onSearch && typeof field.onSearch === "function") {
					results = await field.onSearch(inputValue, formValues);
				}
				// Option 2: API endpoint provided
				else if (field.optionsUrl && apiClient) {
					// Build the URL with query parameter
					const searchParam = field.searchParam || "search";
					const url = field.optionsUrl.includes("?")
						? `${field.optionsUrl}&${searchParam}=${encodeURIComponent(
								inputValue,
							)}`
						: `${field.optionsUrl}?${searchParam}=${encodeURIComponent(
								inputValue,
							)}`;

					const response = await apiClient(url, field.valueId);

					// Handle different response structures
					results = response.data || response;

					// Transform response if needed
					if (
						field.transformResponse &&
						typeof field.transformResponse === "function"
					) {
						results = field.transformResponse(results);
					}
				}

				setOptions(results);
				setSearchError(null);
				return results;
			} catch (error) {
				console.error(`Cannot find search results for ${field.name}`, error);
				setSearchError(
					error.message || "Failed to load search results. Please try again."
				);
				setOptions([]);
			} finally {
				setIsLoading(false);
			}
		},
		[field, apiClient, formValues],
	);

	// Focus search input when dropdown opens and load initial options
	useEffect(() => {
		if (isOpen && searchInputRef.current) {
			searchInputRef.current.focus();
		}

		// If no options are loaded and search is configured, load initial options
		if (
			isOpen &&
			options.length === 0 &&
			(field.optionsUrl || field.onSearch)
		) {
			loadOptions(""); // Load with empty search to get all options
		}
	}, [isOpen, options.length, field.optionsUrl, field.onSearch, loadOptions]);

	// Debounced search handler
	const handleSearchChange = useCallback(
		(inputValue) => {
			setSearchTerm(inputValue);

			// Clear existing timer
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}

			// Set new timer
			const debounceDelay = field.debounceDelay || 300; // Default 300ms
			debounceTimerRef.current = setTimeout(() => {
				loadOptions(inputValue);
			}, debounceDelay);
		},
		[loadOptions, field.debounceDelay],
	);

	// --- END DYNAMIC SEARCH FUNCTIONALITY ---

	// Handle selecting an option
	const handleSelectOption = (option) => {
		const isSelected = selectedValues.some((v) => v.value === option.value);

		let newValues;
		if (isSingleSelect) {
			// Single select mode: replace existing selection or deselect if clicking the same option
			if (isSelected) {
				// Deselect if clicking the same option
				newValues = [];
				// Remove from cache
				setSelectedOptionsCache((prev) => {
					const newCache = { ...prev };
					delete newCache[option.value];
					return newCache;
				});
			} else {
				// Replace with new selection
				newValues = [option];
				// Replace cache with new selection only
				setSelectedOptionsCache({ [option.value]: option });
				// Auto-close after selection in single select mode
				setIsOpen(false);
			}
		} else {
			// Multi select mode: toggle selection
			if (isSelected) {
				// Remove from selection
				newValues = selectedValues.filter((v) => v.value !== option.value);
				// Remove from cache
				setSelectedOptionsCache((prev) => {
					const newCache = { ...prev };
					delete newCache[option.value];
					return newCache;
				});
			} else {
				// Add to selection
				newValues = [...selectedValues, option];
				// Add to cache to preserve the label
				setSelectedOptionsCache((prev) => ({
					...prev,
					[option.value]: option,
				}));
			}
		}

		// Convert to primitive values for form state
		const primitiveValues = newValues.map((v) => v.value);
		handleChange(field.name, primitiveValues);

		// Clear search after selection if configured
		if (field.clearSearchOnSelect) {
			setSearchTerm("");
		}
	};

	// Remove a selected item
	const handleRemoveItem = (value, e) => {
		e.stopPropagation();
		const newValues = selectedValues.filter((v) => v.value !== value);
		const primitiveValues = newValues.map((v) => v.value);
		handleChange(field.name, primitiveValues);
		// Remove from cache
		setSelectedOptionsCache((prev) => {
			const newCache = { ...prev };
			delete newCache[value];
			return newCache;
		});
	};

	// Filter options based on search term (client-side filtering)
	const filteredOptions = options.filter((option) => {
		if (!searchTerm) return true;
		return option.label.toLowerCase().includes(searchTerm.toLowerCase());
	});

	// Render the search and options content (reused in both layouts)
	const renderSearchContent = () => (
		<>
			{/* Search input */}
			<div className="p-3 border-b border-gray-200">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
					<input
						ref={searchInputRef}
						type="text"
						value={searchTerm}
						onChange={(e) => handleSearchChange(e.target.value)}
						placeholder={
							field.optionsUrl || field.onSearch
								? "Type to search..."
								: "Search options..."
						}
						className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
			</div>

      {/* Options list */}
      <div
        className={`overflow-y-auto p-2 max-h-96 flex flex-col gap-0.5 bg-white ${
          isDialogMode ? "max-h-96" : "max-h-60"
        }`}
      >
        {isLoading ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" />
            Searching...
          </div>
        ) : filteredOptions.length > 0 ? (
          filteredOptions.map((option) => {
            const isSelected = selectedValues.some(
              (v) => v.value === option.value
            );
            return (
              <div
                key={option.value}
                onClick={() => handleSelectOption(option)}
                className={`
									px-3 py-2 text-sm rounded cursor-pointer transition-colors
									flex items-center justify-between
									${isSelected ? "bg-blue-500 text-white" : "hover:bg-gray-100 text-gray-800"}
								`}
							>
								<span>{option.label}</span>
								{isSelected && (
									<span className="text-xs font-bold">
										<Check />
									</span>
								)}
							</div>
						);
					})
				) : searchError ? (
					<div className="py-8 px-4 text-center">
						<div className="text-red-500 text-sm font-medium mb-2">⚠️ Search Error</div>
						<div className="text-gray-600 text-xs">{searchError}</div>
					</div>
				) : (
					<div className="py-8 text-center text-gray-500 text-sm">
						{field.optionsUrl || field.onSearch
							? searchTerm.length < (field.minSearchLength || 2)
								? `Type at least ${
										field.minSearchLength || 2
									} characters to search`
								: "No results found"
							: "No options available"}
					</div>
				)}
			</div>
		</>
	);

	return (
		<div
			className={`mb-4 ${
				field.fieldClass ? field.fieldClass : "col-span-full"
			}`}
			ref={!isDialogMode ? dropdownRef : null}
		>
			{/* Main container */}
			<div className="relative">
				{/* Selected values display / trigger button */}
				<div
					onClick={() => !isDisabled && setIsOpen(!isOpen)}
					className={`
						min-h-[42px] px-3 py-2 rounded-lg border transition-all duration-150 cursor-pointer
						flex items-center gap-2 flex-wrap
						${error ? "border-red-500" : "border-gray-300"}
						${
							isDisabled
								? "bg-gray-100 cursor-not-allowed opacity-50"
								: "bg-white hover:border-gray-400"
						}
						${
							isOpen && !isDisabled && !isDialogMode
								? "border-blue-500 ring-2 ring-blue-200"
								: ""
						}
					`}
				>
					{/* Selected items as chips */}
					{selectedValues.length > 0 ? (
						selectedValues.map((item) => (
							<span
								key={item.value}
								className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-200 text-slate-950 rounded-md text-sm"
							>
								{item.label}
								{!isDisabled && (
									<button
										type="button"
										onClick={(e) => handleRemoveItem(item.value, e)}
										className="hover:bg-blue-200 rounded-sm p-0.5 transition-colors"
									>
										<X className="w-3 h-3" />
									</button>
								)}
							</span>
						))
					) : (
						<span className="text-gray-400 text-sm">
							{field.placeholder || "Select options..."}
						</span>
					)}

					{/* Dropdown indicator */}
					<div className="ml-auto flex items-center gap-2">
						{isLoading && (
							<Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
						)}
						<ChevronDown
							className={`w-4 h-4 text-gray-500 transition-transform ${
								isOpen ? "rotate-180" : ""
							}`}
						/>
					</div>
				</div>

				{/* INLINE DROPDOWN MODE */}
				{!isDialogMode && isOpen && !isDisabled && (
					<div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
						{renderSearchContent()}
					</div>
				)}
			</div>

			{/* DIALOG MODE */}
			{isDialogMode && isOpen && !isDisabled && (
				<>
					{/* Backdrop */}
					<div
						className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
						onClick={() => {
							setIsOpen(false);
							handleBlur(field.name);
						}}
					/>

					{/* Dialog */}
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<div
							ref={dropdownRef}
							className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Dialog Header */}
							<div className="flex items-center justify-between p-4 border-b border-gray-200">
								<h3 className="text-lg font-semibold text-gray-900">
									{field.label || "Select Options"}
								</h3>
								<button
									type="button"
									onClick={() => {
										setIsOpen(false);
										handleBlur(field.name);
									}}
									className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							{/* Dialog Content */}
							{renderSearchContent()}

							{/* Dialog Footer */}
							<div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
								<span className="text-sm text-gray-600">
									{isSingleSelect
										? selectedValues.length > 0
											? "1 selected"
											: "None selected"
										: `${selectedValues.length} selected`}
								</span>
								<div className="gap-4 flex">
									<button
										type="button"
										onClick={() => {
											setIsOpen(false);
											handleBlur(field.name);
										}}
										className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition"
									>
										Done
									</button>
									<button
										type="button"
										onClick={() => {
											setIsOpen(false);
											handleBlur(field.name);
										}}
										className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 transition"
									>
										Cancel
									</button>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
export default SearchSelectField;
