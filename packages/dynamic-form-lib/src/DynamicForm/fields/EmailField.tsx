import type { FieldComponentProps, FieldRuntime, InputProps } from "@/types";

type EmailFieldType = FieldRuntime<InputProps>;

type Props = Omit<FieldComponentProps<string, InputProps>, "field"> & {
	field: EmailFieldType;
};

function EmailField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
	disabled = false,
}: Props) {
	const name = field.name;
	const isDisabled = disabled;

	return (
		<input
			{...(field.props ?? {})}
			type="email"
			name={name}
			value={(formValues[name] as string) ?? ""}
			onChange={(e) => handleChange(name, e.target.value)}
			onBlur={() => handleBlur(name)}
			disabled={isDisabled}
			placeholder={field.placeholder}
			className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background
				placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
				focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
				${
					error
						? "border-red-500 focus-visible:ring-red-500"
						: "border-input focus-visible:ring-blue-500"
				}
				${
					isDisabled
						? "bg-gray-100 text-gray-500 cursor-not-allowed"
						: "bg-background"
				}
			`}
		/>
	);
}

export default EmailField;
