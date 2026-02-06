import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";

import type {
	FieldComponentProps,
	FieldRuntime,
	FormValues,
	SelectOption,
} from "@/types";

type SelectFieldType = FieldRuntime & {
	options?: SelectOption[];
	groupLabel?: string;
	separator?: boolean;

	// UI
	placeholder?: string;
	label?: string;
	fieldClass?: string;
};

type Props = Omit<
	FieldComponentProps<string, Record<string, unknown>>,
	"field"
> & {
	field: SelectFieldType;
	formValues: FormValues;
	error?: string | null;
	disabled?: boolean;
};

function SelectField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
	disabled,
}: Props) {
	const name = field.name;

	const value = (formValues[name] as string) ?? "";

	// Keep your existing logic: honour schema-level disabled as well.
	const fieldDisabled =
		typeof field.disabled === "function"
			? field.disabled(formValues)
			: !!field.disabled;

	const isDisabled = !!disabled || fieldDisabled;

	const options = field.options ?? [];

	return (
		<>
			<Select.Root
				value={value}
				onValueChange={(val) => handleChange(name, val)}
				disabled={isDisabled}
			>
				<Select.Trigger
					id={name}
					onBlur={() => handleBlur(name)}
					className={`inline-flex items-center justify-between w-full h-10 rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-background transition-all ${
						error
							? "border-red-500 focus-visible:ring-red-500"
							: "border-input focus-visible:ring-blue-500"
					} ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
				>
					<Select.Value
						placeholder={
							field.placeholder ||
							`Select ${field.label ? field.label.toLowerCase() : ""}`
						}
					/>
					<Select.Icon className="ml-2 text-gray-500">
						<ChevronDown className="w-4 h-4" aria-hidden="true" />
					</Select.Icon>
				</Select.Trigger>

				<Select.Portal>
					<Select.Content
						className="bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[var(--radix-select-trigger-width)]"
						position="popper"
						sideOffset={5}
					>
						<Select.ScrollUpButton className="flex items-center justify-center h-6 text-gray-500 bg-gray-50">
							<Select.Arrow className="fill-white stroke-gray-200" />
						</Select.ScrollUpButton>

						<Select.Viewport className="p-1">
							{field.groupLabel ? (
								<Select.Group>
									<Select.Label className="px-2 py-1 text-xs text-gray-500 uppercase tracking-wide">
										{field.groupLabel}
									</Select.Label>
								</Select.Group>
							) : null}

							{options.map((option) => (
								<Select.Item
									key={option.value}
									value={option.value}
									className={`relative flex items-center px-3 py-2 text-sm rounded cursor-pointer select-none
										data-[state=checked]:bg-blue-50
										data-[state=checked]:text-blue-600
									`}
								>
									<Select.ItemText>{option.label}</Select.ItemText>
								</Select.Item>
							))}

							{field.separator ? (
								<Select.Separator className="my-1 h-px bg-gray-200" />
							) : null}
						</Select.Viewport>

						<Select.Arrow className="fill-white stroke-gray-200" />
					</Select.Content>
				</Select.Portal>
			</Select.Root>

			{error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
		</>
	);
}

export default SelectField;
