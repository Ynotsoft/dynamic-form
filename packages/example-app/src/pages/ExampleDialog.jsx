import { DynamicForm } from "@ynotsoft/dynamic-form";
export default function ExampleDialog({ onClose }) {
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
    <div className="fixed inset-0 bg-black/40 text-black flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[480px] p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Dialog Form</h2>

        <DynamicForm formDefinition={formDefinition} footerMode="normal">
          <div className="flex justify-end gap-4 mt-4">
            <button className="px-3 py-2 bg-gray-300 rounded" onClick={onClose}>
              Close
            </button>

            <button
              className="px-3 py-2 bg-green-600 text-white rounded"
              type="submit"
            >
              Update
            </button>
          </div>
        </DynamicForm>
      </div>
    </div>
  );
}
