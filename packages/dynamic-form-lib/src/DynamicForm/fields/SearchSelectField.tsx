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
	const [searchError, setSearchError] = useState<string | null>(null);

	type SelectedOptionsCache = Record<string, SearchSelectOption | undefined>;
	const [selectedOptionsCache, setSelectedOptionsCache] =
		useState<SelectedOptionsCache>({});

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
				.filter((val): val is string => typeof v === "string" && v.length > 0)
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
			if (!field.optionsUrl && !field.onSearch) return options;
			const minSearchLength = field.minSearchLength ?? 0;
			if (minSearchLength > 0 && inputValue.length < minSearchLength)
				return options;

			setIsLoading(true);
			setSearchError(null);

			try {
				let results: SearchSelectOption[] = [];
				if (field.onSearch) {
					results = await field.onSearch(inputValue, formValues);
				} else if (field.optionsUrl && apiClient) {
					const searchParam = field.searchParam || "search";
					const baseUrl = field.optionsUrl.includes("?")
						? `${field.optionsUrl}&${searchParam}=${encodeURIComponent(inputValue)}`
						: `${field.optionsUrl}?${searchParam}=${encodeURIComponent(inputValue)}`;
					const response = await apiClient(baseUrl);
					const raw =
						typeof response === "object" &&
						response !== null &&
						"data" in response
							? (response as { data: unknown }).data
							: response;
					results = field.transformResponse
						? field.transformResponse(raw)
						: (raw as SearchSelectOption[]);
				}
				setOptions(results);
				return results;
			} catch (err: unknown) {
				const message =
					err instanceof Error ? err.message : "Failed to load search results.";
				setSearchError(message);
				return [];
			} finally {
				setIsLoading(false);
			}
		},
		[field, apiClient, formValues, options],
	);

	useEffect(() => {
		if (isOpen && searchInputRef.current) searchInputRef.current.focus();
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

		handleChange(
			field.name,
			newValues.map((v) => v.value),
		);
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
			<div className="p-3 border-b border-input">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
						className="w-full pl-9 pr-3 py-2 text-sm border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
					/>
				</div>
			</div>

			<div
				className={`overflow-y-auto p-2 flex flex-col gap-0.5 bg-background ${isDialogMode ? "max-h-96" : "max-h-60"}`}
			>
				{isLoading ? (
					<div className="py-8 text-center text-muted-foreground text-sm">
						<Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin text-primary" />
						Searching...
					</div>
				) : filteredOptions.length > 0 ? (
					filteredOptions.map((option) => {
						const isSelected = selectedValues.some(
							(v) => v.value === option.value,
						);
						return (
							<button
								type="button"
								key={option.value}
								onClick={() => handleSelectOption(option)}
								className={`
									px-3 py-2 text-sm rounded cursor-pointer transition-colors
									flex items-center justify-between
									${
										isSelected
											? "bg-primary text-primary-foreground"
											: "hover:bg-accent hover:text-accent-foreground text-foreground"
									}
								`}
							>
								<span>{option.label}</span>
								{isSelected && <Check className="w-4 h-4" />}
							</button>
						);
					})
				) : searchError ? (
					<div className="py-8 px-4 text-center">
						<div className="text-destructive text-sm font-medium mb-2">
							Search Error
						</div>
						<div className="text-muted-foreground text-xs">{searchError}</div>
					</div>
				) : (
					<div className="py-8 text-center text-muted-foreground text-sm">
						{searchTerm.length < (field.minSearchLength ?? 2)
							? `Type at least ${field.minSearchLength ?? 2} characters`
							: "No results found"}
					</div>
				)}
			</div>
		</>
	);

	return (
		<div
			className={`mb-4 ${field.fieldClass || "col-span-full"}`}
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
						flex items-center gap-2 flex-wrap shadow-xs
						${error ? "border-destructive" : "border-input"}
						${isDisabled ? "bg-muted cursor-not-allowed opacity-70" : "bg-background hover:border-ring/50"}
						${isOpen && !isDisabled && !isDialogMode ? "border-ring ring-2 ring-ring/20" : ""}
					`}
				>
					{selectedValues.length > 0 ? (
						selectedValues.map((item) => (
							<span
								key={item.value}
								className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-secondary-foreground border border-border rounded-md text-xs font-medium"
							>
								{item.label}
								{!isDisabled && (
									<button
										type="button"
										onClick={(e) => handleRemoveItem(item.value, e)}
										className="hover:text-destructive transition-colors"
									>
										<X className="w-3 h-3" />
									</button>
								)}
							</span>
						))
					) : (
						<span className="text-muted-foreground text-sm">
							{field.placeholder || "Select options..."}
						</span>
					)}

					<div className="ml-auto flex items-center gap-2">
						{isLoading && (
							<Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
						)}
						<ChevronDown
							className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
						/>
					</div>
				</button>

				{!isDialogMode && isOpen && !isDisabled && (
					<div className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
						{renderSearchContent()}
					</div>
				)}
			</div>

			{isDialogMode && isOpen && !isDisabled && (
				<>
					<div
						className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
						onClick={() => setIsOpen(false)}
					/>
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<div
							ref={dropdownRef}
							className="bg-popover border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
						>
							<div className="flex items-center justify-between p-4 border-b border-border">
								<h3 className="text-lg font-semibold text-foreground">
									{field.label || "Select Options"}
								</h3>
								<button
									onClick={() => setIsOpen(false)}
									className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent transition"
								>
									<X className="w-5 h-5" />
								</button>
							</div>
							{renderSearchContent()}
							<div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
								<span className="text-sm text-muted-foreground">
									{isSingleSelect
										? selectedValues.length > 0
											? "1 selected"
											: "None"
										: `${selectedValues.length} selected`}
								</span>
								<div className="flex gap-2">
									<button
										onClick={() => setIsOpen(false)}
										className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition"
									>
										Done
									</button>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
			{error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
		</div>
	);
}

export default SearchSelectField;
