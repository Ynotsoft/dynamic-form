import React from "react";
import "./App.css";
import { DynamicForm } from "ynotsoft-dynamic-form";

export default function App() {
  const form = {
    fields: [
{
  type: 'checkbox',
  name: 'interests',
  label: 'Select your interests',
  options: [
    { value: 'sports', label: 'Sports', description: 'Athletic activities' },
    { value: 'music', label: 'Music', description: 'Playing or listening' }
  ]
}
    ],
  };

  const handleSubmit = (values) => console.log("Form Submitted:", values);
  const handleRequired = (label) => {};

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h1 className="text-xl font-bold mb-4">DynamicForm Demo</h1>
      <DynamicForm
        formDefinition={form}
        sendFormValues={handleSubmit}
        validateField={handleRequired}
      >
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white hover:bg-blue-600 p-2 rounded-md"
        >
          Submit
        </button>
      </DynamicForm>
    </div>
  );
}
