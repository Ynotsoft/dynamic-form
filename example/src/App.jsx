import React from "react";
import "./App.css";
import { DynamicForm } from "ynotsoft-dynamic-form";

export default function App() {
  const form = {
    fields: [
      {
        name: "Description",
        label: "Category Name",
        type: "text",
        placeholder: "Enter Category Name",
        required: true,
        maxLength: 100,
        fieldClass: "col-span-8",
      },
    ],
  };

  const handleSubmit = (values) => console.log("Form Submitted:", values);

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h1 className="text-xl font-bold mb-4">DynamicForm Demo</h1>
      <DynamicForm formDefinition={form} sendFormValues={handleSubmit} />
    </div>
  );
}
