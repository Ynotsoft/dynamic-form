import React from "react";
// 1. Import DOMPurify after installation
import DOMPurify from "dompurify";

// TODO:  Replace this with a RichTextEditor Like TipTap

const sanitizeHtml = (html) => {
	// 2. Use the imported DOMPurify to sanitize the HTML string
	// This removes all malicious scripts and event handlers.
	return DOMPurify.sanitize(html);
};

function HtmlField({ field, formValues, disabled }) {
	// Determine if the component is disabled
	const isDisabled = disabled;

	// Get the content, preferring formValues if it's been set, falling back to field.content
	const htmlContent = formValues[field.name] || field.content || "";

	// Base class for the wrapper div
	const baseClass = `mb-4 ${field.fieldClass ? field.fieldClass : "col-span-full"}`;

	// Styling for the content display area
	const contentDisplayClasses = `
    w-full px-3 py-2 border rounded-md overflow-y-auto max-h-40 prose prose-sm max-w-none shadow-inner transition duration-150
    ${
			isDisabled
				? "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed" // Disabled state styling
				: "bg-white text-gray-800 border-gray-200 hover:border-gray-300" // Normal state styling
		}
  `.trim();

	return (
		<div key={field.name} className={baseClass} id={`${field.name}_id`}>
			<label htmlFor={field.name} className="block text-sm font-medium mb-1">
				{field.label}
			</label>

			<div
				className={contentDisplayClasses}
				// Secure usage of dangerouslySetInnerHTML with the sanitize function
				dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlContent) }}
			/>
		</div>
	);
}

export default HtmlField;
