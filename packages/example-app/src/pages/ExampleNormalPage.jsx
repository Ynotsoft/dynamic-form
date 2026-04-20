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
  const allowedOnBehalfOf = true;
  const isDraft = true;
  const entitlementDetails = {
    entitlementUUID: "f2444f0a-5a1e-4fe4-8e86-cb9f3a8a23fc",
    behalfOfLanLogonName: "",
  };
  const normaliseShowIf = (showIf) => {
    if (!showIf) return undefined;
    if (typeof showIf === 'function') return showIf;

    if (typeof showIf === 'string') {
      return (values) => {
        try {
          const fn = new Function('values', `return (${showIf})(values);`);
          return !!fn(values);
        } catch {
          return false;
        }
      };
    }

    if (Array.isArray(showIf)) {
      return (values) => {
        return showIf.every(rule => {
          const singleRuleEvaluator = normaliseShowIf(rule);
          return singleRuleEvaluator ? singleRuleEvaluator(values) : true;
        });
      };
    }

    if (typeof showIf === 'object') {
      const rule = showIf;
      return (values) => {
        if (!rule.field) return true;

        const rawValue = values[rule.field];
        const currentValue = rawValue && typeof rawValue === 'object' && 'value' in rawValue
          ? (rawValue).value
          : rawValue;
        const expected = rule.value ?? rule.is;

        switch ((rule.operator || 'equals').toLowerCase().replace(/\s|-/g, '')) {
          case 'notequals':
            return currentValue != expected;
          case 'includes':
            return Array.isArray(currentValue)
              ? currentValue.includes(expected)
              : String(currentValue ?? '').includes(String(expected));
          case 'notincludes':
            return Array.isArray(currentValue)
              ? !currentValue.includes(expected)
              : !String(currentValue ?? '').includes(String(expected));
          case 'isempty':
            return currentValue === undefined || currentValue === null || currentValue === '' || (Array.isArray(currentValue) && currentValue.length === 0);
          case 'isnotempty':
            return !(currentValue === undefined || currentValue === null || currentValue === '' || (Array.isArray(currentValue) && currentValue.length === 0));
          case 'greaterthan':
            return Number(currentValue) > Number(expected);
          case 'lessthan':
            return Number(currentValue) < Number(expected);
          case 'equals':
          default:
            return currentValue == expected;
        }
      };
    }
    return undefined;
  };

  const formDefinition = {
    fields: [{
      name: "requestFor",
      label: "Request For",
      type: "select",
      value: allowedOnBehalfOf
        ? (isDraft && entitlementDetails?.behalfOfLanLogonName ? "behalf" : "")
        : "self",
      options: allowedOnBehalfOf
        ? [
          { label: "Self", value: "self" },
          { label: "On behalf of another", value: "behalf" },
        ]
        : [
          { label: "Self", value: "self" }
        ],
      readOnly: !allowedOnBehalfOf,
      description: !allowedOnBehalfOf ? "This entitlement does not allow on behalf of requests." : "Select the user(s) you are requesting access on behalf of. This entitlement does not allow on behalf of requests.",
    }, {
      name: "onBehalfLanLogonName",
      label: "Select User",
      returnValueOnly: true,
      type: "searchselect",
      required: true,
      optionsUrl: "UserSearch/ByDomainLogin",
      selectMode: "multiple",
      showIf: normaliseShowIf({
        field: "requestFor",
        operator: "equals",
        value: "behalf",
      }),
    },
    {
      name: "domainLanLogonName",
      label: "Select Domain Account",
      type: "select",
      returnValueOnly: true,
      required: false,
      optionsUrl: "UserSearch/GetTargetAccounts",
      selectMode: "multiple",
      queryParams: (value) =>
        `?EntitlementUUID=${entitlementDetails.entitlementUUID}&LanLogonName=${""}&OnBehalfLanLogonName=${value.onBehalfLanLogonName}`,
      showIf: (formValues) => {
        const hasOnBehalfSelection = formValues.requestFor === "behalf";
        return hasOnBehalfSelection;
      },
    },
    {
      name: "domainLanLogonName_count",
      type: "hidden",
      value: 0,
    },
    {
      name: "content",
      label: "Content",
      type: 'html',
      content: '<p>Start writing </p>'
    },

    {
      type: "alert",
      variant: "error",
      title: "Note",
      message:
        "This User does not have access to request this entitlement on behalf of others.",
      showIf: (formValues) => {
        const hasOnBehalfSelection = formValues.requestFor === "behalf";
        const selectedUser = formValues.onBehalfLanLogonName;
        const isMissingAccounts = formValues.domainLanLogonName_count === 0;
        return (
          hasOnBehalfSelection &&
          isMissingAccounts &&
          selectedUser &&
          selectedUser.length > 0
        );
      },
    }, { "id": "field_1773282501233", "type": "searchselect", "name": "user_select", "label": "Manager 1 ", "required": false, "placeholder": "", "description": "", "valueId": "value", "optionsUrl": "usersearch/byemail", "selectMode": "multiple", "value": ["omar@dss.gov.au"] }, { "id": "field_1773802625363", "type": "searchselect", "name": "user_select2", "label": "Manager 2 ", "required": false, "placeholder": "", "description": "", "valueId": "value", "optionsUrl": "usersearch/byemail", "selectMode": "multiple", "value": ["omar@dss.gov.au"] }]
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
