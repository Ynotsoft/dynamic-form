import { DynamicForm } from "@ynotsoft/dynamic-form";

export default function ExampleDrawer({ onClose }) {
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
        disabled: true,
        override: true,
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
    <div className="fixed inset-0 text-black bg-black/40 flex justify-end z-50">
      <div className="w-[420px] h-full bg-white shadow-xl p-6 overflow-y-auto flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Drawer Form</h2>

        <div className="flex-1 overflow-y-auto ">
          <DynamicForm formDefinition={formDefinition} footerMode="sticky">
            <div className="flex justify-end gap-4 mt-4">
              <button
                className="px-3 py-2 bg-gray-300 rounded"
                onClick={onClose}
              >
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
      </div>
    </div>
  );
}
