/**
 * RadioGroupField Component
 * 
 * A Radix UI-based radio group field for DynamicForm
 * 
 * @example
 * // Basic usage (stacked layout)
 * {
 *   type: 'radio',
 *   name: 'plan',
 *   label: 'Select Plan',
 *   options: [
 *     { value: 'basic', label: 'Basic Plan', description: 'Perfect for individuals' },
 *     { value: 'pro', label: 'Pro Plan', description: 'For professionals' },
 *     { value: 'enterprise', label: 'Enterprise', description: 'For large teams' }
 *   ]
 * }
 * 
 * @example
 * // Inline layout
 * {
 *   type: 'radio',
 *   name: 'size',
 *   label: 'Select Size',
 *   inline: true,
 *   options: ['Small', 'Medium', 'Large']
 * }
 * 
 * @example
 * // Simple string options
 * {
 *   type: 'radio',
 *   name: 'color',
 *   label: 'Choose Color',
 *   options: ['Red', 'Green', 'Blue']
 * }
 * 
 * @example
 * // With disabled state
 * {
 *   type: 'radio',
 *   name: 'subscription',
 *   label: 'Subscription Type',
 *   disabled: (formValues) => formValues.hasActiveSubscription,
 *   options: [
 *     { value: 'monthly', label: 'Monthly' },
 *     { value: 'yearly', label: 'Yearly' }
 *   ]
 * }
 */

import React from 'react';
import * as RadioGroup from '@radix-ui/react-radio-group';

function RadioGroupField({ field, formValues, handleChange, handleBlur }) {
  const value = formValues[field.name] || '';
  const isDisabled = typeof field.disabled === 'function' 
    ? field.disabled(formValues) 
    : field.disabled;
  const options = field.options || [];
  const isInline = field.inline || false;

  return (
    <RadioGroup.Root
      value={value}
      onValueChange={(val) => handleChange(field.name, val)}
      onBlur={() => handleBlur(field.name)}
      disabled={isDisabled}
      className={isInline ? 'flex flex-wrap gap-4' : 'space-y-3'}
      aria-label={field.label || field.name}
    >
      {options.map((option) => {
        const optionValue = typeof option === 'object' ? option.value : option;
        const optionLabel = typeof option === 'object' ? option.label : option;

        const optionDescription = typeof option === 'object' ? option.description : null;
        const itemId = `${field.name}-${optionValue}`;

        return (
          <div key={optionValue} className="relative flex items-start">
            <div className="flex h-6 items-center">
              <RadioGroup.Item
                value={optionValue}
                id={itemId}
                disabled={isDisabled}
                className={`
                  relative size-4 rounded-full border transition-all
                  ${isDisabled 
                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                    : 'border-gray-300 bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }
                  data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600
                `}
              >
                <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-1.5 after:h-1.5 after:rounded-full after:bg-white" />
              </RadioGroup.Item>
            </div>
            <div className="ml-3 text-sm">
              <label 
                htmlFor={itemId} 
                className={`font-medium ${isDisabled ? 'text-gray-500' : 'text-gray-900 cursor-pointer'}`}
              >
                {optionLabel}
              </label>
              {optionDescription && !isInline && (
                <p className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                  {optionDescription}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </RadioGroup.Root>
  );
}

export default RadioGroupField;
