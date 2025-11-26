import React from 'react'


function HtmlField({ field, formValues }) {
  const htmlContent = formValues[field.name] || field.content || "";
  
  return (
    <div key={field.name} className={`mb-4 ${field.fieldClass ? field.fieldClass : "col-span-full"}`} id={field.name.toLowerCase() + "_id"}>
      <div 
        className="w-full px-3 py-2 border rounded-md overflow-y-auto max-h-40 prose prose-sm max-w-none" 
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </div>
  )
}

export default HtmlField
