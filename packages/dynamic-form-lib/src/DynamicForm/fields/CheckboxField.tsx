import React from "react";
import type { Field, FormValues } from "../../types";

type CheckboxOption =
	| string
	| {
			value: string;
			label: string;
			description?: string;
	  };

type Props = {
	field: Field & {
		options?: CheckboxOption[];
		inline?: boolean;
		layout?: "inline" | "stacked";
		props?: React.InputHTMLAttributes<HTMLInputElement>;
	};
	formValues: FormValues;
	handleChange: (name: string, value: unknown) => void;
	handleBlur: (name: string) => void;
	error?: string | null;
};

export default function CheckboxField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
}: Props) {
	// Field name is required for this component to work.
	// Your Field type allows it to be optional, so we guard here.
	if (!field.name) return null;

	const name = field.name;

	const isDisabled =
		typeof field.disabled === "function"
			? field.disabled(formValues)
			: !!field.disabled;

	const options = field.options ?? [];
	const isInline = field.inline || field.layout === "inline";

	/* =============================
	   Checkbox group
	   ============================= */
	if (options.length > 0) {
		const selectedValues = Array.isArray(formValues[name])
			? (formValues[name] as string[])
			: [];

		const handleCheckboxGroupChange = (
			optionValue: string,
			isChecked: boolean,
		) => {
			const nextValues = isChecked
				? [...selectedValues, optionValue]
				: selectedValues.filter((v) => v !== optionValue);

			handleChange(name, nextValues);
		};

		const showError = !!error && field.required && selectedValues.length === 0;

		return (
			<div
				className={isInline ? "grid grid-cols-4 gap-3 mt-3" : "space-y-3 mt-3"}
			>
				{options.map((option) => {
					const value = typeof option === "string" ? option : option.value;
					const label = typeof option === "string" ? option : option.label;
					const description =
						typeof option === "string" ? undefined : option.description;

					const id = `${name}-${value}`;
					const checked = selectedValues.includes(value);

					return (
						<div key={value} className="relative flex items-start">
							<div className="flex h-6 items-center">
								<input
									{...field.props}
									id={id}
									type="checkbox"
									checked={checked}
									onChange={(e) =>
										handleCheckboxGroupChange(value, e.target.checked)
									}
									onBlur={() => handleBlur(name)}
									disabled={isDisabled}
									className={`
										size-4 rounded border-gray-300 text-blue-600 transition-all
										focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
										${isDisabled ? "opacity-50 cursor-not-allowed bg-gray-100" : "cursor-pointer hover:border-blue-400"}
										${showError ? "border-red-500" : ""}
									`}
								/>
							</div>

							<div className="ml-3 text-sm">
								<label
									htmlFor={id}
									className={`font-medium ${
										isDisabled
											? "text-gray-500"
											: "text-gray-900 cursor-pointer"
									}`}
								>
									{label}
								</label>

								{description && !isInline && (
									<p
										className={`text-sm ${isDisabled ? "text-gray-400" : "text-gray-500"}`}
									>
										{description}
									</p>
								)}
							</div>
						</div>
					);
				})}
			</div>
		);
	}

	/* =============================
	   Single checkbox
	   ============================= */
	return (
		<div className="mt-1">
			<div className="space-x-2">
				<input
					{...field.props}
					id={`id_${name}`}
					type="checkbox"
					checked={Boolean(formValues[name])}
					onChange={(e) => handleChange(name, e.target.checked)}
					onBlur={() => handleBlur(name)}
					disabled={isDisabled}
					className={`rounded border-gray-300 ${
						isDisabled ? "opacity-50 cursor-not-allowed" : ""
					} ${error ? "border-red-500" : ""}`}
				/>
				<label htmlFor={`id_${name}`}>
					{field.label}
					{field.required && <span className="text-red-500">*</span>}
				</label>
			</div>
		</div>
	);
}
