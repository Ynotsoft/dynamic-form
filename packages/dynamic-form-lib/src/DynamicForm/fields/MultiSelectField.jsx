import React from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";

function MultiSelectField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
	disabled,
}) {
	const fieldDisabled =
		field.disabled && typeof field.disabled === "function"
			? field.disabled(formValues)
			: field.disabled;

	const isDisabled = disabled || fieldDisabled;

	const options = field.options || [];

	const animatedComponents = makeAnimated();

	// --- VALUE NORMALIZATION LOGIC ---

	// 1. Prioritize form state, falling back to the schema's default value.
	const initialValues = formValues[field.name] || field.value || [];

	// Helper to check if the array is already in the react-select object format
	const isArrayOfObjects = (arr) =>
		Array.isArray(arr) &&
		arr.length > 0 &&
		typeof arr[0] === "object" &&
		arr[0] !== null &&
		"value" in arr[0];

	let selectedOptions;

	if (isArrayOfObjects(initialValues)) {
		// Case 1: Value is already an array of option objects (e.g., from fetched data or schema default).
		selectedOptions = initialValues;
	} else {
		// Case 2: Value is a primitive array (e.g., ["sports", "music"]). Needs mapping.
		selectedOptions = initialValues
			.filter((val) => val !== null && val !== undefined)
			.map((rawValue) => options.find((option) => option.value === rawValue))
			.filter((option) => option !== undefined);
	}

	// --- END VALUE NORMALIZATION ---

	return (
		<div
			className={`mb-4 ${field.fieldClass ? field.fieldClass : "col-span-full"}`}
		>
			<Select
				components={animatedComponents}
				isMulti
				isDisabled={isDisabled}
				name={field.label}
				// Pass the normalized value (array of objects) to Select
				value={selectedOptions}
				// IMPORTANT: On change, we must convert the selected objects back to
				// primitive strings to keep the form state clean and consistent.
				onChange={(selected) => {
					const primitiveValues = selected.map((option) => option.value);
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
                        ${
													!isDisabled && state.isFocused
														? "!border-blue-500 ring-2 ring-blue-200"
														: ""
												}
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
