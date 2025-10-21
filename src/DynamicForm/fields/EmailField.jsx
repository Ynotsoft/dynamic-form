import React from 'react';

function EmailField({ field, formValues, handleChange, handleBlur, touched, errors }) {
  //const error = touched[field.name] && errors[field.name];
  const isDisabled = field.readOnly && field.disabled;
    const error = false;
  return (
      <input
        {...field.props}
        type="email"
        value={formValues[field.name] || ""}
        onChange={(e) => handleChange(field.name, e.target.value)}
        onBlur={() => handleBlur(field.name)}
        disabled={isDisabled}
        name={field.name}
        placeholder={field.placeholder}
        className={`w-full px-3 py-2 border rounded-md ${
          error ? "border-red-500" : "border-gray-300"
        } ${isDisabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
      />
  );
}

export default EmailField;