import React from "react";

function InputField({ field, formValues, handleChange, handleBlur, touched, error }) {
  const isDisabled = field.readOnly || field.disabled;

  return (
    <>
      <input
        {...field.props}
        id={field.name}
        type={field.type || ""}
        value={formValues[field.name] || ""}
        onChange={(e) => handleChange(field.name, e.target.value)}
        onBlur={() => handleBlur(field.name)}
        disabled={isDisabled}
        name={field.name}
        placeholder={field.placeholder || ""}
        min={field.minLength}
        max={field.maxLength}
        className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error
          ? "border-red-500 focus-visible:ring-red-500"
          : "border-input focus-visible:ring-blue-500"
          } ${isDisabled
            ? "bg-gray-50 text-gray-500"
            : "bg-background"
          }`}
      />
      {
        error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )
      }
    </>
  );
}

export default InputField;
