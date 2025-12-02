import React from 'react';

// The 'disabled' prop is the effective state calculated in DynamicForm
// (isFundamentallyDisabled && !isOverridden).
function CheckboxField({ field, formValues, handleChange, handleBlur, error, disabled }) {
    const value = formValues[field.name] === true;
	
    const handleCheckboxChange = (e) => {
        // Checkboxes should pass true/false as the value
        handleChange(field.name, e.target.checked);
    };

    return (
        <div className="flex items-center space-x-2">
            <input
                {...field.props}
                type="checkbox"
                id={field.name}
                name={field.name}
                checked={value}
                onChange={handleCheckboxChange}
                onBlur={() => handleBlur(field.name)}
                // Apply the effective disabled state
                disabled={disabled}
                className={`h-4 w-4 rounded border text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
                    ${error ? "border-red-500" : "border-gray-300"}
                    ${disabled ? "bg-gray-100" : "bg-white"}
                `}
            />
            {field.label && (
                <label
                    htmlFor={field.name}
                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${disabled ? "text-gray-500" : "text-gray-700"}`}
                >
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
}

export default CheckboxField;
