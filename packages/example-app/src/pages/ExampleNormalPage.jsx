import { DynamicForm } from "ynotsoft-dynamic-form";
import { mockApiClient } from "../services/mockApi";
import { Button } from "react-day-picker";

export default function ExampleNormalPage() {
  const formDefinition = {
    fields: [
      {
        name: "fullName",
        label: "Full Name",
        type: "input",
        required: true,
        placeholder: "Enter your name",
        value: "John Doe",
        maxLength: 100,
        onChange: (value) => console.log("input selection: ", value),
        validate: (value) => {
          if (value.length < 2) return "Name must be at least 2 characters";
          return null;
        },
      },
      {
        name: "username",
        label: "Search for Users",
        type: "searchselect",
        required: true,
        placeholder: "Type to search users...",
        layout: "inline",
        // layout: "dialog",
        optionsUrl: "/api/users/search", // API endpoint
        minSearchLength: 2, // Minimum characters before search (default: 2)
        selectMode: "single", // 'single' | 'multiple' (default: 'single')
        valueId: "userId",
        onChange: (valueId) => {
          console.log("searchselect changed: ", valueId);
        },
      },

    ],
  };

  return (
    <div className="p-6   rounded shadow border">
      <h2 className="text-xl font-semibold mb-4">Normal Page Form</h2>

      <DynamicForm
        formDefinition={formDefinition}
        returnType={false}
        footerMode="normal"
        debugMode={true}
        apiClient={(url, valueId) => mockApiClient(url, valueId)}
      >
      </DynamicForm>
    </div>
  );
}
