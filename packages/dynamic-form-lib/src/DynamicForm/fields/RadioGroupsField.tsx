import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import type { FieldComponentProps, FieldRuntime, SelectOption } from "@/types";

type RadioOption = string | SelectOption;

type RadioGroupFieldType = FieldRuntime & {
	options?: RadioOption[];
	inline?: boolean;
	renderType?: "segment" | string;
	fieldClass?: string;
};

type Props = Omit<
	FieldComponentProps<string, Record<string, unknown>>,
	"field"
> & {
	field: RadioGroupFieldType;
	error?: string | null;
	disabled?: boolean;
};

function RadioGroupField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
	disabled,
}: Props) {
	const name = field.name;

	const value = (formValues[name] as string) ?? "";
	const isDisabled = !!disabled;

	const options = field.options ?? [];
	const isInline = !!field.inline;
	const isSegmented = field.renderType === "segment";

	const groupContainerClass = isSegmented
		? "mt-2 inline-flex w-full md:w-auto p-1 rounded-md bg-gray-50 border border-gray-200 shadow-inner"
		: isInline
			? "flex flex-wrap gap-4"
			: "space-y-3";

	return (
		<div
			className={`mb-4 ${field.fieldClass ? field.fieldClass : "col-span-full"}`}
		>
			<RadioGroup
				value={value}
				onValueChange={(val) => handleChange(name, val)}
				onBlur={() => handleBlur(name)}
				disabled={isDisabled}
				className={groupContainerClass}
				aria-label={field.label || name}
			>
				{options.map((option) => {
					const optionValue =
						typeof option === "object" ? option.value : option;
					const optionLabel =
						typeof option === "object" ? option.label : option;
					const optionDescription =
						typeof option === "object" ? (option.description ?? null) : null;

					const itemId = `${name}-${optionValue}`;
					const isChecked = value === optionValue;

					if (isSegmented) {
						// --- Segmented Button Look ---
						return (
							<label
								key={optionValue}
								htmlFor={itemId}
								// Styling for the button segment itself
								className={`
                  relative flex-1 min-w-max text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ease-in-out cursor-pointer select-none
                  ${
									isChecked
										? "bg-white text-gray-900 shadow-md ring-2 ring-gray-100"
										: "text-gray-500 hover:bg-gray-100" // Unselected state
								}
                ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
							>
								<RadioGroupItem
									value={optionValue}
									id={itemId}
									disabled={isDisabled}
									// Visually hide the native radio circle but keep it for function/accessibility
									className="absolute truncate h-0 w-0 opacity-0 pointer-events-none"
								/>
								{optionLabel}
							</label>
						);
					}

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
								/>
							</div>

							<div className="ml-3 text-sm">
								<label
									htmlFor={itemId}
									className={`font-medium ${
										isDisabled
											? "text-gray-500"
											: "text-gray-900 cursor-pointer"
									}`}
								>
									{optionLabel}
								</label>

								{optionDescription && !isInline ? (
									<p
										className={`text-sm ${
											isDisabled ? "text-gray-400" : "text-gray-500"
										}`}
									>
										{optionDescription}
									</p>
								) : null}
							</div>
						</div>
					);
				})}
			</RadioGroup>

			{error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
		</div>
	);
}

export default RadioGroupField;
