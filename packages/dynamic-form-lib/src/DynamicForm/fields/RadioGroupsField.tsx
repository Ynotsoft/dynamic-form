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

	// Container styling for the segmented look
	const groupContainerClass = isSegmented
		? "mt-2 flex w-full p-1 rounded-lg bg-slate-50 border border-slate-200"
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
					const itemId = `${name}-${optionValue}`;
					const isChecked = value === optionValue;

					if (isSegmented) {
						return (
							<div key={optionValue} className="flex-1">
								<RadioGroupItem
									value={optionValue}
									id={itemId}
									disabled={isDisabled}
									className="sr-only" // Use Tailwind's sr-only to hide the circle completely
								/>
								<label
									htmlFor={itemId}
									className={`
										flex items-center justify-center px-4 py-6 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer select-none
										${
											isChecked
												? "bg-white text-blue-700 shadow-sm border border-slate-200"
												: "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
										}
										${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
									`}
								>
									{optionLabel}
								</label>
							</div>
						);
					}

					// Standard Radio Look
					return (
						<div key={optionValue} className="relative flex items-start">
							<div className="flex h-6 items-center">
								<RadioGroupItem
									value={optionValue}
									id={itemId}
									disabled={isDisabled}
									className="size-4 rounded-full border border-slate-300 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
								/>
							</div>
							<div className="ml-3 text-sm">
								<label
									htmlFor={itemId}
									className={`font-medium ${isDisabled ? "text-slate-500" : "text-slate-900 cursor-pointer"}`}
								>
									{optionLabel}
								</label>
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
