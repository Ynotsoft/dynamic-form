import React from "react";

function EmailField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
	disabled,
}) {
	// Use the calculated disabled state directly.
	const isDisabled = disabled;

	return (
		<>
			<input
				{...field.props}
				type="email"
				value={formValues[field.name] || ""}
				onChange={(e) => handleChange(field.name, e.target.value)}
				onBlur={() => handleBlur(field.name)}
				disabled={isDisabled}
				name={field.name}
				placeholder={field.placeholder}
				className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
					error
						? "border-red-500 focus-visible:ring-red-500"
						: "border-input focus-visible:ring-blue-500"
				} ${isDisabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-background"}`}
			/>
			{error && <p className="mt-1 text-sm text-red-500">{error}</p>}
		</>
	);
}

export default EmailField;

