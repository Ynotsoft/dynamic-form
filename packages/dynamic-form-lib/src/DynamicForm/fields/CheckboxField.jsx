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
	// 1. Destructure custom props to prevent React DOM warnings
	const {
		apiClient,
		api_URL,
		charCount,
		setCharCounts,
		fileInputRefs,
		...rest
	} = props;

	const isDisabled = disabled;
	const options = field.options || [];
	const isInline = field.inline || field.layout === "inline";
	const errorId = rest["aria-describedby"];

	const checkboxBaseClass = `
		size-4 rounded border-input bg-background transition-all accent-primary
		focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
		disabled:cursor-not-allowed disabled:opacity-50
	`;

	// --- GROUP RENDER (Multiple Options) ---
	if (options.length > 0) {
		const selectedValues = Array.isArray(formValues[field.name])
			? formValues[field.name]
			: [];

		const handleCheckboxGroupChange = (optionValue, isChecked) => {
			let newValues = isChecked
				? [...selectedValues, optionValue]
				: selectedValues.filter((v) => v !== optionValue);
			handleChange(field.name, newValues);
			handleBlur(field.name);
		};

		return (
			<fieldset
				className="mt-2"
				aria-invalid={!!error}
				aria-describedby={error ? errorId : undefined}
			>
				{/* Legend provides context to Screen Readers for the whole group */}
				<legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-4">
					{field.label}
					{field.required && <span className="text-destructive ml-1">*</span>}
				</legend>

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
										{...rest} // Using filtered props
										type="checkbox"
										id={itemId}
										checked={isChecked}
										onChange={(e) =>
											handleCheckboxGroupChange(optionValue, e.target.checked)
										}
										onBlur={() => handleBlur(field.name)}
										disabled={isDisabled}
										className={`${checkboxBaseClass} ${
											!isDisabled && "cursor-pointer hover:border-primary/50"
										} ${error ? "border-destructive ring-destructive/20" : "border-input"}`}
									/>
								</div>
								<div className="ml-3 text-sm leading-6">
									<label
										htmlFor={itemId}
										className={`font-medium select-none transition-colors ${
											isDisabled
												? "text-muted-foreground"
												: "text-foreground cursor-pointer group-hover:text-primary"
										}`}
									>
										{optionLabel}
									</label>
									{optionDescription && !isInline && (
										<p
											className={`text-xs ${isDisabled ? "text-muted-foreground/60" : "text-muted-foreground"}`}
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

	// --- SINGLE RENDER (Boolean Toggle) ---
	return (
		<div className="mt-1 flex items-start group">
			<div className="flex h-6 items-center">
				<input
					{...field.props}
					{...rest} // Using filtered props
					id={field.name}
					type="checkbox"
					checked={!!formValues[field.name]}
					onChange={(e) => {
						handleChange(field.name, e.target.checked);
						handleBlur(field.name);
					}}
					onBlur={() => handleBlur(field.name)}
					disabled={isDisabled}
					className={`${checkboxBaseClass} ${
						!isDisabled && "cursor-pointer hover:border-primary/50"
					} ${error ? "border-destructive" : "border-input"}`}
				/>
			</div>
			<div className="ml-3 text-sm leading-6">
				<label
					htmlFor={field.name}
					className={`font-medium select-none transition-colors ${
						isDisabled
							? "text-muted-foreground"
							: "text-foreground cursor-pointer group-hover:text-primary"
					}`}
				>
					{field.label}
					{field.required && (
						<span className="text-destructive ml-1" aria-hidden="true">
							*
						</span>
					)}
				</label>
			</div>
		</div>
	);
}

export default CheckboxField;
