import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React from "react";

function RadioGroupField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
	disabled,
	...props // Capture ARIA props: aria-describedby, aria-invalid
}) {
	const value = formValues[field.name] || "";
	const isDisabled = disabled;
	const options = field.options || [];
	const isInline = field.inline || false;
	const isSegmented = field.renderType === "segment";
	const errorId = props["aria-describedby"];

	// Container using theme variables for background and border
	const groupContainerClass = isSegmented
		? "mt-2 inline-flex w-full p-1 rounded-lg bg-muted/50 border border-border shadow-inner"
		: isInline
			? "flex flex-wrap gap-6 mt-2"
			: "space-y-4 mt-2";

	return (
		<fieldset
			className={`mb-4 ${field.fieldClass ? field.fieldClass : "col-span-full"}`}
			aria-labelledby={`${field.name}-legend`}
			aria-describedby={errorId}
		>
			<legend id={`${field.name}-legend`} className="sr-only">
				{field.label}
			</legend>

			<RadioGroup
				{...props}
				value={value}
				onValueChange={(val) => handleChange(field.name, val)}
				onBlur={() => handleBlur(field.name)}
				disabled={isDisabled}
				className={groupContainerClass}
			>
				{options.map((option) => {
					const optionValue =
						typeof option === "object" ? option.value : option;
					const optionLabel =
						typeof option === "object" ? option.label : option;
					const optionDescription =
						typeof option === "object" ? option.description : null;
					const itemId = `${field.name}-${optionValue}`;
					const isChecked = value === optionValue;

					if (isSegmented) {
						return (
							<label
								key={optionValue}
								htmlFor={itemId}
								// focus-within keeps focus indicator on label for modern look
								className={`
									relative flex-1 min-w-max text-center px-4 py-2 rounded-md text-sm font-medium 
									transition-all duration-200 cursor-pointer select-none
									focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2
									${
										isChecked
											? "bg-background text-primary shadow-sm"
											: "text-muted-foreground hover:text-foreground"
									}
									${isDisabled ? "opacity-40 cursor-not-allowed" : ""}
								`}
							>
								<RadioGroupItem
									value={optionValue}
									id={itemId}
									disabled={isDisabled}
									className="sr-only"
								/>
								{optionLabel}
							</label>
						);
					}

					return (
						<div key={optionValue} className="relative flex items-start group">
							<div className="flex h-6 items-center">
								<RadioGroupItem
									value={optionValue}
									id={itemId}
									disabled={isDisabled}
									className={`
										size-4 flex items-center justify-center rounded-full border border-input transition-all
										focus:ring-2 focus:ring-ring focus:ring-offset-2 ring
										data-[state=checked]:bg-primary                     
                    data-[state=checked]::after:content-[''] 
                    data-[state=checked]::after:absolute 
                    data-[state=checked]::after:size-2.5 
                    data-[state=checked]::after:rounded-full 
                    data-[state=checked]::after:bg-white 
                    data-[state=checked]::after:border-[3px] 
                    data-[state=checked]::after:border-background 
										${
											isDisabled
												? "bg-muted opacity-50"
												: "bg-background cursor-pointer hover:border-primary/50"
										}
									`}
								/>
							</div>
							<div className="ml-3 text-sm leading-6">
								<label
									htmlFor={itemId}
									className={`font-medium transition-colors ${
										isDisabled
											? "text-muted-foreground"
											: "text-foreground cursor-pointer group-hover:text-primary"
									}`}
								>
									{optionLabel}
								</label>
								{optionDescription && !isInline && (
									<p
										className={`${isDisabled ? "text-muted-foreground/60" : "text-muted-foreground"}`}
									>
										{optionDescription}
									</p>
								)}
							</div>
						</div>
					);
				})}
			</RadioGroup>
		</fieldset>
	);
}

export default RadioGroupField;
