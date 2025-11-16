import Select from 'react-select'
import makeAnimated from 'react-select/animated'

function MultiSelectField({ field, formValues, handleChange, handleBlur, error }) {
    const isDisabled = field.disabled && field.disabled(formValues);
    const options = field.options || [];

    const animatedComponents = makeAnimated();

    const currentValues = formValues[field.name] || [];

    return (
      <>
        <Select
          components={animatedComponents}
          isMulti
          isDisabled={isDisabled}
          name={field.label}
          value={currentValues}
          onChange={(selected) => handleChange(field.name, selected)}
          options={options}
          placeholder={field.placeholder}
          closeMenuOnSelect={false}
          onBlur={() => handleBlur(field.name)}
          className={error ? "border-red-500" : ""}
          styles={{
            control: (base) => ({
              ...base,
              borderColor: error ? '#ef4444' : base.borderColor,
              '&:hover': {
                borderColor: error ? '#ef4444' : base['&:hover']?.borderColor
              }
            })
          }}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </>
    );
}
export default MultiSelectField;