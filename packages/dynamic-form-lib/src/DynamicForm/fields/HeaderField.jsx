import React from "react";

function HeaderField({ field }) {
	const text = field.text || field.label || "";
	const description = field.description || "";
	// Size: 'md', 'lg', 'xl', '2xl', '3xl' - Use '2xl' as the default heading size
	const size = field.size || "2xl";
	// Separator: Use 'line' for a divider, 'space' for extra vertical padding, or false/undefined for none
	const separator = field.separator || false;
	// Alignment: 'left', 'center', 'right'
	const align = field.align || "left";
	const customClass = field.className || "";

	// Size mappings for font size and weight
	// Note: We use h2 and h3 structure for semantic flexibility.
	const sizeClasses = {
		md: "text-lg font-semibold",
		lg: "text-xl font-bold",
		xl: "text-2xl font-extrabold",
		"2xl": "text-3xl font-extrabold",
		"3xl": "text-4xl font-extrabold",
	};

	// Alignment mappings
	const alignClasses = {
		left: "text-left",
		center: "text-center",
		right: "text-right",
	};

	// Separator styling based on the 'separator' field
	const separatorClasses = {
		line: "border-b border-gray-200 pb-3",
		space: "pb-4",
		false: "",
	};

	// Primary header class, ensuring full width and responsive styling
	const headerClass = `
    ${sizeClasses[size] || sizeClasses["2xl"]} 
    ${alignClasses[align] || alignClasses.left}
    ${customClass}
    text-gray-900 tracking-tight w-full 
  `.trim();

	// Description class with subdued text color
	// We use text-lg for description for better visual hierarchy contrast
	const descriptionClass = `
    mt-1 text-lg text-gray-500 w-full
    ${alignClasses[align] || alignClasses.left}
  `.trim();

	return (
		// Wrapper div ensures the component spans the full width of the container
		<div
			className={`my-6 col-span-full w-full border-b border-gray-300 pb-2 ${separatorClasses[separator] || separatorClasses.false}`}
		>
			{/* Use h2 for the main title as it is the most common use case for a form section header */}
			<h2 className={headerClass}>{text}</h2>
			{/* Use p tag for the descriptive text */}
			{description && <p className={descriptionClass}>{description}</p>}
		</div>
	);
}

export default HeaderField;
