import React from "react";
import "./App.css";
import { DynamicForm } from "ynotsoft-dynamic-form";

export default function App() {
  const form = {
    fields: [
      {
        name: "Description",
        label: "Category ",
        type: "email",
        // content: '<div class="alert">Important notice here</div>',
        placeholder: "Enter Category Name",
        maxLength: 100,
        fieldClass: "col-span-8",
        // options: [
        //   { label: "Option 1", value: "option1" },
        //   { label: "Option 2", value: "option2" },
        //   { label: "Option 3", value: "option3" },
        // ],
      },
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
