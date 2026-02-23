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
      {
        name: "projectDates",
        label: "Project Timeline",
        type: "dateRange",
        required: true,
        placeholder: "Select date range",
        value: {
          from: new Date("2025-01-01"),
          to: new Date("2025-12-31"),
        },
      },
      {
        name: "birthDate",
        label: "Birth Date",
        type: "date",
        required: true,
        placeholder: "Select date",
        value: new Date("1990-01-01"),
      },
      {
        name: "documents",
        label: "Upload Documents",
        type: "file", // or 'multifile' for multiple
        required: true,
        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
        maxSize: 5 * 1024 * 1024, // 5 MB
        multiple: false,
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
      ></DynamicForm>
    </div>
  );
}
