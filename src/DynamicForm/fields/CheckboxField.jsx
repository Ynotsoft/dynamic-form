

function CheckboxField({field, formValues, handleChange, handleBlur, error}) {
  const isDisabled = field.disabled && field.disabled(formValues);
  
  return (
    <div className="mt-1">
      <div className="space-x-2">
        <input
          {...field.props}
          id={"id_" + field.name}
          type="checkbox"
          checked={formValues[field.name] || false}
          onChange={(e) => handleChange(field.name, e.target.checked)}
          onBlur={() => handleBlur(field.name)}
          disabled={isDisabled}
          className={`rounded border-gray-300 ${
            isDisabled ? "opacity-50 cursor-not-allowed" : ""
          } ${error ? "border-red-500" : ""}`}
        />
        <label className="" htmlFor={"id_" + field.name}>
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </label>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default CheckboxField