import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React from "react";

function RadioGroupField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
}) {
	const value = formValues[field.name] || "";
	const isDisabled =
		typeof field.disabled === "function"
			? field.disabled(formValues)
			: field.disabled;
	const options = field.options || [];
	const isInline = field.inline || false;

	return (
		<>
			<RadioGroup
				value={value}
				onValueChange={(val) => handleChange(field.name, val)}
				onBlur={() => handleBlur(field.name)}
				disabled={isDisabled}
				className={isInline ? "flex flex-wrap gap-4" : "space-y-3"}
				aria-label={field.label || field.name}
			>
				{options.map((option) => {
					const optionValue =
						typeof option === "object" ? option.value : option;
					const optionLabel =
						typeof option === "object" ? option.label : option;

					const optionDescription =
						typeof option === "object" ? option.description : null;
					const itemId = `${field.name}-${optionValue}`;

					return (
						<div key={optionValue} className="relative flex items-start">
							<div className="flex h-6 items-center">
								<RadioGroupItem
									value={optionValue}
									id={itemId}
									disabled={isDisabled}
									className={`
                  relative size-4 rounded-full border transition-all
                  ${
										isDisabled
											? "border-gray-300 bg-gray-100 cursor-not-allowed"
											: "border-gray-300 bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
									}
                  data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600
                `}
								>
									{/* <RadioGroupIndicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-1.5 after:h-1.5 after:rounded-full after:bg-white" /> */}
								</RadioGroupItem>
							</div>
							<div className="ml-3 text-sm">
								<label
									htmlFor={itemId}
									className={`font-medium ${isDisabled ? "text-gray-500" : "text-gray-900 cursor-pointer"}`}
								>
									{optionLabel}
								</label>
								{optionDescription && !isInline && (
									<p
										className={`text-sm ${isDisabled ? "text-gray-400" : "text-gray-500"}`}
									>
										{optionDescription}
									</p>
								)}
							</div>
						</div>
					);
				})}
			</RadioGroup>
			{error && <p className="mt-1 text-sm text-red-500">{error}</p>}
		</>
	);
}

export default RadioGroupField;
