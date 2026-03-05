function InputField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
	disabled,
	...props
}) {
	// Destructure the custom props that belong to your logic, not the DOM.
	// This prevents them from being spread into the <input> via ...rest
	const {
		apiClient,
		api_URL,
		charCount,
		setCharCounts,
		fileInputRefs,
		...rest // These are standard HTML/ARIA props (like aria-describedby)
	} = props;

	const isDisabled = disabled;
	const errorId = rest["aria-describedby"];

	return (
		<input
			{...field.props}
			{...rest}
			id={field.name}
			name={field.name}
			type={field.type || "text"}
			value={formValues[field.name] || ""}
			onChange={(e) => handleChange(field.name, e.target.value)}
			onBlur={() => handleBlur(field.name)}
			disabled={isDisabled}
			placeholder={field.placeholder || ""}
			minLength={field.minLength}
			maxLength={field.maxLength}
			aria-invalid={!!error}
			aria-describedby={error ? errorId : undefined}
			className={`
				flex h-10 w-full rounded-md border px-3 py-2 text-sm 
				transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium 
				placeholder:text-muted-foreground 
				focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
				disabled:cursor-not-allowed disabled:opacity-50
				${
					error
						? "border-destructive focus-visible:ring-destructive"
						: "border-input focus-visible:ring-ring"
				} 
				${
					isDisabled
						? "bg-muted text-muted-foreground"
						: "bg-background text-foreground"
				}
				${field.className || ""}
			`}
		/>
	);
}

export default InputField;
