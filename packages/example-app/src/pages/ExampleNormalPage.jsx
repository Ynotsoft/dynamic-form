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
        class: "col-span-6",
        required: true,
        placeholder: "Enter your name",
        description: "Use this to enter your full name",
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
        class: "col-span-6",
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
        id: "field_001",
        type: "html",
        name: "blog_content",
        label: "Article Body",
        required: true,
        content: "<p>Start writing your masterpiece here...</p>",
        fieldClass: "col-span-12",
        placeholder: "Enter your content",
      },
      {
        name: "sort",
        label: "Sort Order",
        type: "select",
        required: true,
        options: [
          { value: "us", label: "United States" },
          { value: "uk", label: "United Kingdom" },
          { value: "ca", label: "Canada" },
        ],
        description:
          "Sort by priority. 1 = Highest Priority , 5 = Lowest Priority", // Use to add description below fields
      },
      {
        name: "birthDate",
        label: "Birth Date",
        type: "date",
        required: true,
        placeholder: "Select date",
        value: "2000-01-15", // Add a date string to test the parser
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
        name: "agreeTerms",
        label: "I agree to terms",
        type: "checkbox",
        required: true,
        value: false,
        description: "By checking this, you agree to our terms and conditions",
        options: [
          { value: "option1", label: "Option 1", description: "" },
          { value: "option2", label: "Option 2", description: "" },
          { value: "option3", label: "Option 3", description: "" },
        ],
        layout: "inline", // 'inline' | 'stacked' | 'default'

        containerStyle: "card", // Wraps in bordered card
        color: "blue", // 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'indigo' | 'gray' | 'pink' | 'orange'
      },
      {
        name: "number",
        label: "Number Field",
        type: "number",
        min: 1,
        max: 9,
      },

      {
        name: "paymentMethod",
        label: "Payment Method",
        type: "radiogroup",
        required: true,
        value: "card",
        options: [
          { value: "card", label: "Credit Card" },
          { value: "paypal", label: "PayPal" },
          { value: "bank", label: "Bank Transfer" },
        ],

        // Layout options
        inline: true, // Display options horizontally

        // Card container styling
        containerStyle: "card",
        color: "green",
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
        <Button className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit
        </Button>
        <Button
          className="bg-gray-600 text-white px-4 py-2 rounded"
          onClick={(s) => console.log(s)}
        >
          Reset
        </Button>
      </DynamicForm>
    </div>
  );
}
