import { DynamicForm } from "@ynotsoft/dynamic-form";

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
        disabled: true,
        override: false,
        maxLength: 100,
        onChange: (value) => console.log("input selection: ", value),
        validate: (value) => {
          console.log(value);
          if (value.length < 2) return "Name must be at least 2 characters";
          return null;
        },
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        required: true,
        disabled: true,
        override: true,
        placeholder: "you@example.com",
        value: "john@example.com",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: false,
        placeholder: "Enter description...",
        rows: 4,
        maxLength: 500,
        showCharCount: true,
        value: "Initial description",
      },

      {
        name: "agreeTerms",
        // label: "I agree to terms",
        type: "checkbox",
        required: true,
        value: false,
        description: "By checking this, you agree to our terms and conditions",
        options: [
          {
            value: "sports",
            label: "Sports",
            description: "Athletic activities",
          },
          {
            value: "music",
            label: "Music",
            description: "Playing or listening",
          },
          { value: "art", label: "Art", description: "Creative visual arts" },
          {
            value: "technology",
            label: "Technology",
            description: "Tech gadgets and news",
          },
          {
            value: "travel",
            label: "Travel",
            description: "Exploring new places",
          },
          { value: "food", label: "Food", description: "Culinary delights" },
          {
            value: "fitness",
            label: "Fitness",
            description: "Health and exercise",
          },
          {
            value: "gaming",
            label: "Gaming",
            description: "Video games and esports",
          },
        ],
        // Layout options
        layout: "inline", // 'inline' | 'stacked' | 'default',
        onChange: () =>
          console.log("checkbox selection: ", formValues.agreeTerms),
        // Card container styling
        containerStyle: "card", // Wraps in bordered card
        color: "blue", // 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'indigo' | 'gray' | 'pink' | 'orange'
        fieldClass: "flex-start",
      },
      {
        name: "paymentMethod",
        label: "Payment Method",
        type: "radiogroup",
        required: true,
        value: "card",
        variant: "cards", // 'default' | 'cards'
        options: [
          { value: "card", label: "Credit Card" },
          { value: "paypal", label: "PayPal" },
          { value: "bank", label: "Bank Transfer" },
        ],

        // Layout options
        inline: true, // Display options horizontally

        // Color variants
        color: "blue", // 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'indigo' | 'gray' | 'pink' | 'orange'

        // Card container styling
        containerStyle: "card",
      },

      {
        name: "birthDate",
        label: "Birth Date",
        fieldClass: "col-span-8",
        type: "date",
        required: true,
        placeholder: "Select date",
        value: new Date("1990-01-01"),
      },
    ],
  };

  return (
    <div className="p-6 bg-white text-black rounded shadow border">
      <h2 className="text-xl font-semibold mb-4">Normal Page Form</h2>

      <DynamicForm
        formDefinition={formDefinition}
        footerMode="normal"
        debugMode={true}
      >
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
