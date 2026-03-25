import { DynamicForm } from "ynotsoft-dynamic-form";
import { mockApiClient } from "../services/mockApi";
import { Button } from "react-day-picker";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default function ExampleNormalPage() {
  const formDefinition = {
    fields: [{ "id": "field_1773282501233", "type": "searchselect", "name": "user_select", "label": "Manager 1 ", "required": false, "placeholder": "", "description": "", "valueId": "value", "optionsUrl": "usersearch/byemail", "selectMode": "multiple", "value": ["omar@dss.gov.au"] }, { "id": "field_1773802625363", "type": "searchselect", "name": "user_select2", "label": "Manager 2 ", "required": false, "placeholder": "", "description": "", "valueId": "value", "optionsUrl": "usersearch/byemail", "selectMode": "multiple", "value": ["omar@dss.gov.au"] }]
  };
  return (
    <div className="p-6   rounded shadow border">
      <h2 className="text-xl font-semibold mb-4">Normal Page Form</h2>
      <DynamicForm
        formDefinition={formDefinition}
        returnType={false}
        footerMode="normal"
        debugMode={true}
        apiClient={api}
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
