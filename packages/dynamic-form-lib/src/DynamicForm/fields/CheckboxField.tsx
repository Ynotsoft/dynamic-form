import React from "react";
import { Check } from "lucide-react";
import type {
	FieldComponentProps,
	FieldRuntime,
	FormValues,
	InputProps,
} from "@/types";

type CheckboxOption =
	| string
	| {
			value: string;
			label: string;
			description?: string;
	  };

export type CheckboxFieldType = FieldRuntime<InputProps> & {
	options?: CheckboxOption[];
	inline?: boolean;
	layout?: "inline" | "stacked" | "grid";
};

type Props = Omit<FieldComponentProps<unknown, InputProps>, "field"> & {
	field: CheckboxFieldType;
	formValues: FormValues;
	error?: string | null;
};

export default function CheckboxField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
	disabled,
}: Props) {
	const name = field.name;

	const isDisabled =
		typeof field.disabled === "function"
			? field.disabled(formValues)
			: (disabled ?? !!field.disabled);

	const options = field.options ?? [];

	/* =============================
	   Checkbox group (Pill/Chip Style)
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

		return (
			<div className="flex flex-col gap-5 py-1">
				<div className="flex flex-wrap gap-3">
					{options.map((option) => {
						const value = typeof option === "string" ? option : option.value;
						const label = typeof option === "string" ? option : option.label;
						const id = `${name}-${value}`;
						const checked = selectedValues.includes(value);

						return (
							<label
								key={value}
								htmlFor={id}
								className={`
									relative flex items-center gap-2.5 px-3 py-1.5 rounded-md border transition-all duration-200 select-none
									${
										checked
											? "border-primary bg-background shadow-md ring-1 ring-primary"
											: "border-border bg-muted/85 hover:border-ring"
									}
									${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-95"}
									${error && !checked ? "border-destructive" : ""}
								`}
							>
								<input
									{...(field.props ?? {})}
									id={id}
									type="checkbox"
									checked={checked}
									onChange={(e) =>
										handleCheckboxGroupChange(value, e.target.checked)
									}
									onBlur={() => handleBlur(name)}
									disabled={isDisabled}
									className="sr-only"
								/>

								{/* Selection Indicator */}
								{checked && (
									<div className="flex items-center justify-center size-6 rounded-full  animate-in zoom-in-75 duration-150">
										<Check className="size-4 text-primary stroke-[4px]" />
									</div>
								)}

								<span
									className={`text-base font-medium ${checked ? "text-primary" : "text-muted-foreground"}`}
								>
									{label}
								</span>
							</label>
						);
					})}
				</div>
				{error && (
					<p className="text-sm text-destructive font-medium">{error}</p>
				)}
			</div>
		);
	}

	/* =============================
	   Single checkbox (Theme Bound)
	   ============================= */
	const isChecked = Boolean(formValues[name]);

	return (
		<div className="flex flex-col gap-2">
			<label
				htmlFor={`id_${name}`}
				className={`
					inline-flex items-center gap-3 px-5 py-3 border transition-all rounded-[var(--radius)]
					${isChecked ? "border-primary bg-background shadow-sm ring-1 ring-primary" : "border-border hover:bg-accent"}
					${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-[0.98]"}
					${error ? "border-destructive" : ""}
				`}
			>
				<input
					{...(field.props ?? {})}
					id={`id_${name}`}
					type="checkbox"
					checked={isChecked}
					onChange={(e) => handleChange(name, e.target.checked)}
					onBlur={() => handleBlur(name)}
					disabled={isDisabled}
					className="sr-only"
				/>
				<div
					className={`
					flex items-center justify-center size-5 rounded-sm border transition-all
					${isChecked ? "bg-primary border-primary" : "bg-background border-input"}
				`}
				>
					{isChecked && (
						<Check className="size-3 text-primary-foreground stroke-[4px]" />
					)}
				</div>
				<span
					className={`text-sm font-medium ${isChecked ? "text-foreground" : "text-muted-foreground"}`}
				>
					{field.label}
					{field.required && <span className="ml-1 text-destructive">*</span>}
				</span>
			</label>
			{error && (
				<p className="text-xs text-destructive font-medium px-2">{error}</p>
			)}
		</div>
	);
}
