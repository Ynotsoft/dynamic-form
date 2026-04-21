import React from "react";

function HeaderField({ field }) {
    const text = field.text || field.label || "";
    const description = field.description || "";
    
    // Size: Visual size for the header
    const size = field.size || "lg";
    
    // Underline: boolean for border
    const underline = field.underline || false;
    
    // Alignment: 'left', 'center', 'right'
    const align = field.align || "left";
    
    const customClass = field.className || "";

    // Visual size mappings - CORRECTED
    const sizeClasses = {
        sm: "text-sm font-semibold",
        base: "text-base font-bold",
        lg: "text-lg font-bold",
    };

    // Alignment mappings
    const alignClasses = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
    };

    // Primary header class
    const headerClass = `
    ${sizeClasses[size]} 
    ${alignClasses[align] || alignClasses.left}
    ${customClass}
    text-gray-900 tracking-tight w-full 
  `.trim();

    // Description class
    const descriptionClass = `
    mt-1 text-sm text-gray-500 w-full
    ${alignClasses[align] || alignClasses.left}
  `.trim();

    return (
        <div
            className={`my-6 col-span-full w-full ${underline ? 'border-b border-gray-200 pb-3' : ''}`}
        >
            <h2 className={headerClass}>{text}</h2>
            {description && <p className={descriptionClass}>{description}</p>}
        </div>
    );
}

export default HeaderField;