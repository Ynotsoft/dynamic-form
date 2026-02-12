import Select from "react-select";
import makeAnimated from "react-select/animated";

import type {
	FieldComponentProps,
	FieldRuntime,
	FormValues,
	SelectOption,
} from "@/types";

type MultiSelectFieldType = FieldRuntime & {
	options?: SelectOption[];
	fieldClass?: string;
	placeholder?: string;
	value?: unknown;
};

type Props = Omit<
	FieldComponentProps<string[], Record<string, unknown>>,
	"field"
> & {
	field: MultiSelectFieldType;
	formValues: FormValues;
	error?: string | null;
};

type ReactSelectOption = { value: string; label: string; description?: string };

const animatedComponents = makeAnimated();

function isArrayOfOptionObjects(value: unknown): value is ReactSelectOption[] {
	return (
		Array.isArray(value) &&
		value.length > 0 &&
		typeof value[0] === "object" &&
		value[0] !== null &&
		"value" in (value[0] as Record<string, unknown>)
	);
}

function MultiSelectField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
	disabled,
}: Props) {
	const fieldDisabled =
		typeof field.disabled === "function"
			? field.disabled(formValues)
			: !!field.disabled;

	const isDisabled = !!disabled || fieldDisabled;

	const options: ReactSelectOption[] = (field.options ?? []).map((o) => ({
		value: o.value,
		label: o.label,
		description: o.description,
	}));

	const raw = formValues[field.name] ?? field.value ?? [];
	const initialValues = Array.isArray(raw) ? raw : [];

	let selectedOptions: ReactSelectOption[];

	if (isArrayOfOptionObjects(initialValues)) {
		selectedOptions = initialValues;
	} else {
		selectedOptions = (initialValues as unknown[])
			.filter((v): v is string => typeof v === "string" && v.length > 0)
			.map((val) => options.find((o) => o.value === val))
			.filter((o): o is ReactSelectOption => !!o);
	}

	return (
		<div
			className={`mb-4 ${field.fieldClass ? field.fieldClass : "col-span-full"}`}
		>
			<Select<ReactSelectOption, true>
				components={animatedComponents}
				isMulti
				isDisabled={isDisabled}
				name={field.name}
				value={selectedOptions}
				onChange={(selected) => {
					const primitiveValues = (selected ?? []).map(
						(option) => option.value,
					);
					handleChange(field.name, primitiveValues);
				}}
				options={options}
				placeholder={field.placeholder}
				closeMenuOnSelect={false}
				onBlur={() => handleBlur(field.name)}
				classNamePrefix="react-select"
				unstyled // Use this to remove default react-select inline styles
				classNames={{
					control: (state) => `
						rounded-lg min-h-[42px] transition-all duration-200 border shadow-xs px-1
						${error ? "border-destructive" : "border-input"}
						${isDisabled ? "bg-muted cursor-not-allowed opacity-70" : "bg-background"}
						${!isDisabled && state.isFocused ? "border-ring ring-2 ring-ring/20" : "hover:border-ring/50"}
					`,
					valueContainer: () => "gap-1 py-1",
					placeholder: () => "text-muted-foreground ml-1",
					input: () => "text-foreground ml-1",
					singleValue: () => "text-foreground",
					multiValue: () =>
						"bg-secondary text-secondary-foreground rounded-md border border-border px-1",
					multiValueLabel: () => "text-xs font-medium py-0.5",
					multiValueRemove: () =>
						"ml-1 text-muted-foreground hover:text-destructive transition-colors",
					indicatorsContainer: () => "gap-1",
					dropdownIndicator: () =>
						"text-muted-foreground hover:text-foreground p-2",
					clearIndicator: () =>
						"text-muted-foreground hover:text-destructive p-2",
					menu: () =>
						"bg-popover border border-border shadow-md rounded-lg mt-2 z-50 overflow-hidden",
					menuList: () => "p-1",
					option: (state) => `
						py-2 px-3 text-sm rounded-sm cursor-pointer transition-colors
						${state.isSelected ? "bg-primary text-primary-foreground" : ""}
						${state.isFocused && !state.isSelected ? "bg-accent text-accent-foreground" : ""}
						${!state.isFocused && !state.isSelected ? "text-foreground" : ""}
					`,
					noOptionsMessage: () =>
						"p-4 text-muted-foreground text-sm text-center",
				}}
			/>
			{error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
		</div>
	);
}

export default MultiSelectField;
