/**
 * HeaderField Component
 * 
 * A header/title field for DynamicForm to display section headers, titles, or dividers
 * 
 * @example
 * // Large header (h1)
 * {
 *   type: 'header',
 *   text: 'Personal Information',
 *   size: 'xl' // or '2xl', '3xl', '4xl'
 * }
 * 
 * @example
 * // Medium header with description (h2)
 * {
 *   type: 'header',
 *   text: 'Contact Details',
 *   description: 'Please provide your contact information',
 *   size: 'lg'
 * }
 * 
 * @example
 * // Small header (h3)
 * {
 *   type: 'header',
 *   text: 'Account Settings',
 *   size: 'md'
 * }
 * 
 * @example
 * // Header with underline
 * {
 *   type: 'header',
 *   text: 'Billing Information',
 *   underline: true,
 *   size: 'lg'
 * }
 * 
 * @example
 * // Header with custom styling
 * {
 *   type: 'header',
 *   text: 'Important Section',
 *   size: 'xl',
 *   className: 'text-blue-600',
 *   align: 'center' // 'left', 'center', 'right'
 * }
 */

import React from 'react';

function HeaderField({ field }) {
  const text = field.text || field.label || '';
  const description = field.description || '';
  const size = field.size || 'lg'; // 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'
  const underline = field.underline || false;
  const align = field.align || 'left'; // 'left', 'center', 'right'
  const customClass = field.className || '';

  // Size mappings
  const sizeClasses = {
    sm: 'text-base font-semibold',
    md: 'text-lg font-semibold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl font-bold',
    '2xl': 'text-3xl font-bold',
    '3xl': 'text-4xl font-bold',
    '4xl': 'text-5xl font-bold',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const headerClass = `
    ${sizeClasses[size] || sizeClasses.lg}
    ${alignClasses[align] || alignClasses.left}
    ${underline ? 'border-b-2 border-gray-300 pb-2' : ''}
    ${customClass}
    text-gray-900
  `.trim();

  const descriptionClass = `
    mt-1 text-sm text-gray-600
    ${alignClasses[align] || alignClasses.left}
  `.trim();

  return (
    <div className="my-4">
      <h2 className={headerClass}>
        {text}
      </h2>
      {description && (
        <p className={descriptionClass}>
          {description}
        </p>
      )}
    </div>
  );
}

export default HeaderField;
