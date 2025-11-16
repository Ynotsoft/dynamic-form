import React from 'react'

function DayTimePickerField({ field, formValues, handleChange, handleBlur, error }) {
  // Fallback component if MUI Date Pickers are not available
  return (
    <div>
      <input
        type="datetime-local"
        value={field.value || ''}
        onChange={(e) => handleChange(field.name, e.target.value)}
        onBlur={handleBlur}
        className={`border rounded px-3 py-2 w-full ${
          error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
        }`}
        placeholder="Select date and time"
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      <p className="text-sm text-gray-500 mt-1">
        Note: Install @mui/x-date-pickers for enhanced date picker functionality
      </p>
    </div>
  )
}
export default DayTimePickerField



