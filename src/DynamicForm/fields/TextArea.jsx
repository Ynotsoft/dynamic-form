import React, { useRef, useEffect } from "react";

function TextAreaField({
  field,
  formValues,
  handleChange,
  handleBlur,
  error,
  charCount,
  setCharCounts,
}) {
  const textareaRef = useRef(null);
  const value = formValues[field.name] || "";
  const isDisabled =
    typeof field.disabled === "function"
      ? field.disabled(formValues)
      : field.disabled || field.readOnly;

  // Auto-resize logic
  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight + 2}px`;
    }
  };

  // Auto-resize on mount & when value changes
  useEffect(() => {
    autoResize();
  }, [value]);

  const handleTextareaChange = (e) => {
    handleChange(field.name, e.target.value);
    autoResize();

    if (setCharCounts) {
      setCharCounts((prev) => ({
        ...prev,
        [field.name]: e.target.value.length,
      }));
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        {...field.props}
        ref={textareaRef}
        id={field.name}
        name={field.name}
        placeholder={field.placeholder || ""}
        value={value}
        onChange={handleTextareaChange}
        onBlur={() => handleBlur(field.name)}
        disabled={isDisabled}
        maxLength={field.maxLength}
        rows={field.rows || 3}
        className={`flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-y-auto ${
          error 
            ? "border-red-500 focus-visible:ring-red-500" 
            : "border-input focus-visible:ring-blue-500"
        } ${
          isDisabled 
            ? "bg-gray-50 text-gray-500" 
            : "bg-background"
        }`}
        style={{
          minHeight: "80px",
          maxHeight: "400px",
        }}
      />

      <div className="flex justify-between items-center">
        {/* Character counter */}
        {field.maxLength && !field.readOnly && (
          <span className="text-xs text-gray-500">
            {charCount || 0}/{field.maxLength} characters
          </span>
        )}
      </div>
      
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default TextAreaField;
