
import type { FieldComponentProps, FieldRuntime, InputProps } from "@/types";

type InputFieldType = FieldRuntime<InputProps> & {
	type?: string;
	minLength?: number;
	maxLength?: number;
};

type Props = Omit<FieldComponentProps<string, InputProps>, "field"> & {
	field: InputFieldType;
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
	const isDisabled = !!disabled;

	return (
		<input
			{...(field.props ?? {})}
			id={name}
			type={field.type || ""}
			value={(formValues[name] as string) ?? ""}
			onChange={(e) => handleChange(name, e.target.value)}
			onBlur={() => handleBlur(name)}
			disabled={isDisabled}
			name={name}
			placeholder={field.placeholder || ""}
			minLength={field.minLength}
			maxLength={field.maxLength}
			className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
				error
					? "border-red-500 focus-visible:ring-red-500"
					: "border-input focus-visible:ring-blue-500"
			} ${
				isDisabled ? "bg-gray-50 text-gray-500" : "bg-background"
			}`}
		/>
	);
}

export default InputField;

