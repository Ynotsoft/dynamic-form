import React from "react";

function HeaderField({ field }) {
	const text = field.text || field.label || "";
	const description = field.description || "";
	
	// Size: Visual size for the header
	const size = field.size || "lg";
	
	// Separator/Underline: 'line' for border, 'space' for padding, or false
	const separator = field.separator || field.underline || false;
	
	// Alignment: 'left', 'center', 'right'
	const align = field.align || "left";
	
	const customClass = field.className || "";

	// Visual size mappings
	const sizeClasses = {
		xs: "text-xs font-semibold",
		sm: "text-sm font-semibold",
		base: "text-base font-bold",
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

	// Separator styling
	const separatorClasses = {
		line: "border-b border-gray-200 pb-3",
		space: "pb-4",
		false: "",
	};

	// Primary header class
	const headerClass = `
    ${sizeClasses[size] || sizeClasses.lg} 
    ${alignClasses[align] || alignClasses.left}
    ${customClass}
    text-gray-900 tracking-tight w-full 
  `.trim();

	// Description class
	const descriptionClass = `
    mt-1 text-base text-gray-500 w-full
    ${alignClasses[align] || alignClasses.left}
  `.trim();

	return (
		<div
			className={`my-6 col-span-full w-full ${separatorClasses[separator] || ""}`}
		>
			<h2 className={headerClass}>{text}</h2>
			{description && <p className={descriptionClass}>{description}</p>}
		</div>
	);
}

export default HeaderField;
