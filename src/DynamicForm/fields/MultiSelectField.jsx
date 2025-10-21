import Select from 'react-select'
import makeAnimated from 'react-select/animated'

function MultiSelectField({ field, formValues, handleChange, touched, errors, handleBlur }) {
   //const error = touched[field.name] && errors[field.name];
    const isDisabled = field.disabled && field.disabled(formValues);
    const options = field.options || [];

    const animatedComponents = makeAnimated();

    const currentValues = formValues[field.name] || [];

    return (

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
        />

    );
}
export default MultiSelectField;