import React from 'react'

function DayTimePickerField({ field, formValues, handleChange, handleBlur, touched, errors }) {
  // Fallback component if MUI Date Pickers are not available
  return (
    <div>
      <input
        type="datetime-local"
        value={field.value || ''}
        onChange={(e) => handleChange(field.name, e.target.value)}
        onBlur={handleBlur}
        className="border rounded px-3 py-2 w-full"
        placeholder="Select date and time"
      />
      <p className="text-sm text-gray-500 mt-1">
        Note: Install @mui/x-date-pickers for enhanced date picker functionality
      </p>
    </div>
  )
}
export default DayTimePickerField



