import React from "react";

function CheckboxField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
	disabled,
	...props
}) {
	const isDisabled = disabled;
	const options = field.options || [];
	const isInline = field.inline || field.layout === "inline";
	const errorId = props["aria-describedby"];

	const checkboxBaseClass = `
		size-4 rounded border-gray-300 text-blue-600 transition-all 
		focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
		dark:bg-slate-900 dark:border-slate-700
	`;

	if (options.length > 0) {
		const selectedValues = Array.isArray(formValues[field.name])
			? formValues[field.name]
			: [];

		const handleCheckboxGroupChange = (optionValue, isChecked) => {
			let newValues = isChecked
				? [...selectedValues, optionValue]
				: selectedValues.filter((v) => v !== optionValue);
			handleChange(field.name, newValues);
		};

		return (
			<fieldset
				className="mt-2"
				aria-invalid={props["aria-invalid"]}
				aria-describedby={errorId}
			>
				<legend className="sr-only">{field.label}</legend>

				<div
					className={isInline ? "flex flex-wrap gap-x-6 gap-y-3" : "space-y-4"}
				>
					{options.map((option) => {
						const optionValue =
							typeof option === "object" ? option.value : option;
						const optionLabel =
							typeof option === "object" ? option.label : option;
						const optionDescription =
							typeof option === "object" ? option.description : null;
						const itemId = `${field.name}-${optionValue}`;
						const isChecked = selectedValues.includes(optionValue);

						return (
							<div
								key={optionValue}
								className="relative flex items-start group"
							>
								<div className="flex h-6 items-center">
									<input
										{...field.props}
										{...props}
										type="checkbox"
										id={itemId}
										checked={isChecked}
										onChange={(e) =>
											handleCheckboxGroupChange(optionValue, e.target.checked)
										}
										onBlur={() => handleBlur(field.name)}
										disabled={isDisabled}
										className={`${checkboxBaseClass} ${
											isDisabled
												? "opacity-40 cursor-not-allowed grayscale"
												: "cursor-pointer hover:border-blue-500 hover:ring-1 hover:ring-blue-500/20"
										} ${error ? "border-red-500 ring-red-200" : ""}`}
									/>
								</div>
								<div className="ml-3 text-sm leading-6">
									<label
										htmlFor={itemId}
										className={`font-medium select-none transition-colors ${
											isDisabled
												? "text-gray-400"
												: "text-slate-700 dark:text-slate-200 cursor-pointer group-hover:text-blue-600"
										}`}
									>
										{optionLabel}
									</label>
									{optionDescription && !isInline && (
										<p
											className={`${isDisabled ? "text-gray-400" : "text-slate-500 dark:text-slate-400"}`}
										>
											{optionDescription}
										</p>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</fieldset>
		);
	}

	return (
		<div className="mt-1 flex items-start group">
			<div className="flex h-6 items-center">
				<input
					{...field.props}
					{...props}
					id={field.name}
					type="checkbox"
					checked={!!formValues[field.name]}
					onChange={(e) => handleChange(field.name, e.target.checked)}
					onBlur={() => handleBlur(field.name)}
					disabled={isDisabled}
					className={`${checkboxBaseClass} ${
						isDisabled
							? "opacity-40 cursor-not-allowed grayscale"
							: "cursor-pointer hover:border-blue-500"
					} ${error ? "border-red-500" : ""}`}
				/>
			</div>
			<div className="ml-3 text-sm leading-6">
				<label
					htmlFor={field.name}
					className={`font-medium select-none ${
						isDisabled
							? "text-gray-400"
							: "text-slate-700 dark:text-slate-200 cursor-pointer group-hover:text-blue-600"
					}`}
				>
					{field.label}
					{field.required && (
						<span className="text-red-500 ml-1" aria-hidden="true">
							*
						</span>
					)}
				</label>
			</div>
		</div>
	);
}

export default CheckboxField;
