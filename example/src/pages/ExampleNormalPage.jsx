import { DynamicForm } from "ynotsoft-dynamic-form";

export default function ExampleNormalPage() {
  const formDefinition = {
    fields: [
      {
        name: "Firstname",
        label: "First Name",
        type: "text",
        placeholder: "Enter Category Name",
        required: true,
        maxLength: 100,
        fieldClass: "col-span-full",
      },

      {
        label: "Client",
        name: "First Name",
        type: "text",
        placeholder: "Enter Category Name",
        required: true,
        maxLength: 100,
        fieldClass: "col-span-full",
      },
      {
        type: "text",
        label: "Budget",
        name: "Budget",
        required: true,
        placeholder: "Enter environment description",
        helpText: "A descriptive name for this environment",
        fieldClass: "col-span-full",
      },
      {
        type: "text",
        label: "Deadline",
        name: "Deadline",
        required: true,
        placeholder: "Enter environment description",
        helpText: "A descriptive name for this environment",
        fieldClass: "col-span-full",
      },
    ],
  };

  return (
    <div className="p-6 bg-white text-black rounded shadow border">
      <h2 className="text-xl font-semibold mb-4">Normal Page Form</h2>

      <DynamicForm formDefinition={formDefinition} footerMode="normal">
        <div className="flex justify-end gap-4 mt-4">
          <button className="px-3 py-2 bg-gray-300 rounded" type="button">
            Cancel
          </button>
          <button
            className="px-3 py-2 bg-blue-600 text-white rounded"
            type="submit"
          >
            Save
          </button>
        </div>
      </DynamicForm>
    </div>
  );
}
