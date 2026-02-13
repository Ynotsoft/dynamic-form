import type {
	FieldComponentProps,
	FieldRuntime,
	InputProps,
	FormValues,
} from "@/types";

type InputFieldType = FieldRuntime<InputProps> & {
	type?: string;
	minLength?: number;
	maxLength?: number;
};

// Assuming formValues is passed correctly from the parent
type Props = Omit<FieldComponentProps<string, InputProps>, "field"> & {
	field: InputFieldType;
	formValues: FormValues; // Ensure this is explicitly typed
};

function InputField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
	disabled,
}: Props) {
	const name = field.name;

	// Determine disabled state (matching your SearchSelect logic)
	const fieldDisabled =
		typeof field.disabled === "function"
			? field.disabled(formValues)
			: !!field.disabled;

	const isDisabled = !!disabled || fieldDisabled;

	// Defensive check: handle potential nested paths or missing values
	const displayValue = (formValues[name] as string) ?? "";

	return (
		<input
			// Spread props first so internal logic overrides them
			{...(field.props ?? {})}
			id={name}
			name={name}
			type={field.type || "text"} // Default to "text" if empty
			value={displayValue}
			onChange={(e) => handleChange(name, e.target.value)}
			onBlur={() => handleBlur(name)}
			disabled={isDisabled}
			placeholder={field.placeholder || ""}
			minLength={field.minLength}
			maxLength={field.maxLength}
			className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
				error
					? "border-red-500 focus-visible:ring-red-500"
					: "border-input focus-visible:ring-blue-500"
			} ${isDisabled ? "bg-gray-50 text-gray-500" : "bg-background"}`}
		/>
	);
}

export default InputField;
