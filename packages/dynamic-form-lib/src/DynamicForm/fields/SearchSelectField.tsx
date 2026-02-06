import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";

import type {
	ApiClient,
	FieldComponentProps,
	FieldRuntime,
	FormValues,
	SelectOption,
} from "@/types";

type SearchSelectOption = SelectOption;

type SearchSelectFieldType = FieldRuntime & {
	options?: SearchSelectOption[];
	layout?: "inline" | "dialog" | string;
	selectMode?: "single" | "multi" | string;
	optionsUrl?: string;
	searchParam?: string;
	minSearchLength?: number;
	debounceDelay?: number;
	clearSearchOnSelect?: boolean;
	onSearch?: (
		inputValue: string,
		values: FormValues,
	) => Promise<SearchSelectOption[]>;
	transformResponse?: (raw: unknown) => SearchSelectOption[];
	fieldClass?: string;
	placeholder?: string;
};

type Props = Omit<
	FieldComponentProps<string[], Record<string, unknown>>,
	"field"
> & {
	field: SearchSelectFieldType;
	formValues: FormValues;
	error?: string | null;
	disabled?: boolean;
	apiClient?: ApiClient;
};

type SelectedCache = Record<string, SearchSelectOption>;

function isArrayOfOptionObjects(value: unknown): value is SearchSelectOption[] {
	return (
		Array.isArray(value) &&
		value.length > 0 &&
		typeof value[0] === "object" &&
		value[0] !== null &&
		"value" in (value[0] as Record<string, unknown>)
	);
}

function SearchSelectField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
	disabled,
	apiClient,
}: Props) {
	const fieldDisabled =
		typeof field.disabled === "function"
			? field.disabled(formValues)
			: !!field.disabled;

	const isDisabled = !!disabled || fieldDisabled;
	const layoutMode = field.layout || "inline";
	const isDialogMode = layoutMode === "dialog";
	const isSingleSelect = field.selectMode === "single";

	const [options, setOptions] = useState<SearchSelectOption[]>(
		field.options ?? [],
	);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchError, setSearchError] = useState(null);
	const [selectedOptionsCache, setSelectedOptionsCache] = useState({}); // Cache for selected option labels
	const debounceTimerRef = useRef(null);
	const dropdownRef = useRef(null);
	const searchInputRef = useRef(null);

	// --- VALUE NORMALIZATION LOGIC ---

	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const dropdownRef = useRef<HTMLDivElement | null>(null);
	const searchInputRef = useRef<HTMLInputElement | null>(null);

	const rawCurrent = formValues[field.name];
	const currentValues = Array.isArray(rawCurrent) ? rawCurrent : [];

	let selectedValues: SearchSelectOption[] = [];

	if (currentValues.length > 0) {
		if (isArrayOfOptionObjects(currentValues)) {
			selectedValues = currentValues;
		} else {
			selectedValues = (currentValues as unknown[])
				.filter(
					(val): val is string => typeof val === "string" && val.length > 0,
				)
				.map((rawValue) => {
					const found = options.find((o) => o.value === rawValue);
					if (found) return found;
					const cached = selectedOptionsCache[rawValue];
					if (cached) return cached;
					return { value: rawValue, label: `Loading... (${rawValue})` };
				});
		}
	}

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node | null;
			if (
				dropdownRef.current &&
				target &&
				!dropdownRef.current.contains(target)
			) {
				setIsOpen(false);
				handleBlur(field.name);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [field.name, handleBlur]);

	const loadOptions = useCallback(
		async (inputValue: string): Promise<SearchSelectOption[]> => {
			if (!field.optionsUrl && !field.onSearch) {
				return options;
			}

			const minSearchLength = field.minSearchLength ?? 0;
			if (minSearchLength > 0 && inputValue.length < minSearchLength) {
				return options;
			}

			setIsLoading(true);
			setSearchError(null); // Clear previous errors

			try {
				let results: SearchSelectOption[] = [];

				if (field.onSearch) {
					results = await field.onSearch(inputValue, formValues);
				} else if (field.optionsUrl && apiClient) {
					const searchParam = field.searchParam || "search";
					const url = field.optionsUrl.includes("?")
						? `${field.optionsUrl}&${searchParam}=${encodeURIComponent(inputValue)}`
						: `${field.optionsUrl}?${searchParam}=${encodeURIComponent(inputValue)}`;

					const response = await apiClient(url, field.valueId);

					if (field.transformResponse) {
						results = field.transformResponse(raw);
					} else {
						results = raw as SearchSelectOption[];
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

	useEffect(() => {
		if (isOpen && searchInputRef.current) {
			searchInputRef.current.focus();
		}

		if (
			isOpen &&
			options.length === 0 &&
			(field.optionsUrl || field.onSearch)
		) {
			void loadOptions("");
		}
	}, [isOpen, options.length, field.optionsUrl, field.onSearch, loadOptions]);

	const handleSearchChange = useCallback(
		(inputValue: string) => {
			setSearchTerm(inputValue);
			if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
			const debounceDelay = field.debounceDelay ?? 300;
			debounceTimerRef.current = setTimeout(() => {
				void loadOptions(inputValue);
			}, debounceDelay);
		},
		[loadOptions, field.debounceDelay],
	);

	const handleSelectOption = (option: SearchSelectOption) => {
		const isSelected = selectedValues.some((v) => v.value === option.value);
		let newValues: SearchSelectOption[];

		if (isSingleSelect) {
			if (isSelected) {
				newValues = [];
				setSelectedOptionsCache((prev) => {
					const next = { ...prev };
					delete next[option.value];
					return next;
				});
			} else {
				newValues = [option];
				setSelectedOptionsCache({ [option.value]: option });
				setIsOpen(false);
			}
		} else {
			if (isSelected) {
				newValues = selectedValues.filter((v) => v.value !== option.value);
				setSelectedOptionsCache((prev) => {
					const next = { ...prev };
					delete next[option.value];
					return next;
				});
			} else {
				newValues = [...selectedValues, option];
				setSelectedOptionsCache((prev) => ({
					...prev,
					[option.value]: option,
				}));
			}
		}

		const primitiveValues = newValues.map((v) => v.value);
		handleChange(field.name, primitiveValues);
		if (field.clearSearchOnSelect) setSearchTerm("");
	};

	const handleRemoveItem = (
		value: string,
		e: React.MouseEvent<HTMLButtonElement>,
	) => {
		e.stopPropagation();
		const newValues = selectedValues.filter((v) => v.value !== value);
		handleChange(
			field.name,
			newValues.map((v) => v.value),
		);
		setSelectedOptionsCache((prev) => {
			const next = { ...prev };
			delete next[value];
			return next;
		});
	};

	const filteredOptions = options.filter((option) => {
		if (!searchTerm) return true;
		return option.label.toLowerCase().includes(searchTerm.toLowerCase());
	});

	const renderSearchContent = () => (
		<>
			<div className="p-3 border-b border-gray-200">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
						className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
									${isSelected ? "bg-primary text-gray-800" : "hover:bg-gray-100 text-gray-800"}
								`}
							>
								<span>{option.label}</span>
								{isSelected ? (
									<span className="text-xs font-bold">
										<Check className="w-4 h-4" />
									</span>
								) : null}
							</button>
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
							? searchTerm.length < (field.minSearchLength ?? 2)
								? `Type at least ${field.minSearchLength ?? 2} characters to search`
								: "No results found"
							: "No options available"}
					</div>
				)}
			</div>
		</>
	);

	return (
		<div
			className={`mb-4 ${field.fieldClass ? field.fieldClass : "col-span-full"}`}
			ref={!isDialogMode ? dropdownRef : undefined}
		>
			<div className="relative">
				<button
					type="button"
					aria-haspopup="listbox"
					aria-expanded={isOpen}
					disabled={isDisabled}
					onClick={() => setIsOpen(!isOpen)}
					className={`
						w-full min-h-[42px] px-3 py-2 rounded-lg border transition-all duration-150 text-left
						flex items-center gap-2 flex-wrap
						${error ? "border-red-500" : "border-gray-300"}
						${isDisabled ? "bg-gray-100 cursor-not-allowed opacity-50" : "bg-white hover:border-gray-400"}
						${isOpen && !isDisabled && !isDialogMode ? "border-blue-500 ring-2 ring-blue-200" : ""}
					`}
				>
					{selectedValues.length > 0 ? (
						selectedValues.map((item) => (
							<span
								key={item.value}
								className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-200 text-slate-950 rounded-md text-sm"
							>
								{item.label}
								{!isDisabled ? (
									<button
										type="button"
										onClick={(e) => handleRemoveItem(item.value, e)}
										className="hover:bg-blue-300 rounded-sm p-0.5 transition-colors"
										aria-label={`Remove ${item.label}`}
									>
										<X className="w-3 h-3" />
									</button>
								) : null}
							</span>
						))
					) : (
						<span className="text-gray-400 text-sm">
							{field.placeholder || "Select options..."}
						</span>
					)}

					<div className="ml-auto flex items-center gap-2">
						{isLoading ? (
							<Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
						) : null}
						<ChevronDown
							className={`w-4 h-4 text-gray-500 transition-transform ${
								isOpen ? "rotate-180" : ""
							}`}
						/>
					</div>
				</button>

				{!isDialogMode && isOpen && !isDisabled ? (
					<div className="absolute label-dropdown z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
						{renderSearchContent()}
					</div>
				) : null}
			</div>

			{isDialogMode && isOpen && !isDisabled ? (
				<>
					<div
						className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
						aria-hidden="true"
						onClick={() => {
							setIsOpen(false);
							handleBlur(field.name);
						}}
					/>

					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<div
							ref={dropdownRef}
							role="dialog"
							aria-modal="true"
							className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all"
						>
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

							{renderSearchContent()}

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
										className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition"
									>
										Done
									</button>
									<button
										type="button"
										onClick={() => {
											setIsOpen(false);
											handleBlur(field.name);
										}}
										className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-secondary-400 transition"
									>
										Cancel
									</button>
								</div>
							</div>
						</div>
					</div>
				</>
			) : null}
		</div>
	);
}

export default SearchSelectField;
