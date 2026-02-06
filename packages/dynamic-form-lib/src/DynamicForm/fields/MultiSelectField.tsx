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
	value?: unknown; // default schema value
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

	// Prioritise form state, fall back to schema default.
	const raw = formValues[field.name] ?? field.value ?? [];
	const initialValues = Array.isArray(raw) ? raw : [];

	let selectedOptions: ReactSelectOption[];

	if (isArrayOfOptionObjects(initialValues)) {
		// Already in react-select object format
		selectedOptions = initialValues;
	} else {
		// Primitive array -> map to option objects
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
				name={field.label ?? field.name}
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
				classNames={{
					control: (state) =>
						`!rounded-lg !min-h-[42px] transition duration-150 !shadow-sm 
						${error ? "!border-red-500" : "!border-gray-300"}
						${isDisabled ? "!bg-gray-100 !cursor-not-allowed" : "!bg-white"}
						${!isDisabled && state.isFocused ? "!border-blue-500 ring-2 ring-blue-200" : ""}
						${!isDisabled && !state.isFocused && !error ? "hover:!border-gray-400" : ""}
						`,
					valueContainer: () => `py-0.5 px-2`,
					placeholder: () => `text-gray-400`,
					dropdownIndicator: () => `!text-gray-400 hover:!text-gray-600`,
					multiValue: () => `!bg-blue-100 !text-blue-800 !rounded-md`,
					multiValueLabel: () => `!text-blue-800 !pr-1`,
					multiValueRemove: () =>
						`!text-blue-500 hover:!bg-blue-200 hover:!text-blue-700 !rounded-r-md`,
					menu: () => `!shadow-lg !rounded-lg !mt-2 !z-50`,
					option: (state) =>
						`!py-2 !px-3 !text-sm !cursor-pointer 
						${state.isSelected ? "!bg-blue-500 !text-white" : ""}
						${state.isFocused && !state.isSelected ? "!bg-gray-100 !text-gray-800" : ""}
						`,
				}}
			/>
		</div>
	);
}

export default MultiSelectField;
