# DynamicForm AI Assistant - Quick Prompt

## � QUICK START: Tell AI What You Need

Just fill in this simple template and paste it:

```
=== FORM REQUEST ===

Form Type: [Dialog / In-Page Form]

Form Purpose: [e.g., "User Registration", "Company Creation"]

API Endpoint: [e.g., "/api/users"]
HTTP Method: [POST / PUT / PATCH]

Fields Needed:
1. [Field Name] - Type: [input/email/select/etc.] - Required: [Yes/No] - Notes: [special requirements]
2. [Field Name] - Type: [input/email/select/etc.] - Required: [Yes/No] - Notes: [special requirements]
3. ...

Submit Button Text: [e.g., "Create User"]

Success Action: [e.g., "Close dialog and refresh table"]

Additional Notes: [Any special requirements]

=== END REQUEST ===
```

**That's it!** The AI will create all necessary files for you.

> 📖 **For detailed instructions, templates, and patterns:** Read the full prompt below or see `example.md` for all field types.

---

## 📝 EXAMPLE REQUEST

```
=== FORM REQUEST ===

Form Type: Dialog

Form Purpose: Create New Company

API Endpoint: /api/companies
HTTP Method: POST

Fields Needed:
1. Company Name - Type: input - Required: Yes - Notes: Max 100 characters
2. Email - Type: email - Required: Yes - Notes: Must be valid email
3. Country - Type: select - Required: Yes - Notes: Options from /api/countries
4. Industry - Type: multiselect - Required: No - Notes: Options: ['Tech', 'Finance', 'Healthcare']
5. Description - Type: textarea - Required: No - Notes: Max 500 characters
6. Active Status - Type: checkbox - Required: No - Notes: Default checked

Submit Button Text: Create Company

Success Action: Close dialog and show success toast, then refresh companies list

Additional Notes:
- Show state field only if country is 'US'
- Use blue card styling for the active checkbox

=== END REQUEST ===
```

---

## ⚡ ULTRA-SHORT FORMAT

For simple forms, just say:

```
Create a dialog for [purpose] with:
- [Field] ([type], required)
- [Field] ([type])
Submit to: [endpoint]
```

Example:
```
Create a dialog for Contact Form with:
- Name (input, required)
- Email (email, required)
- Message (textarea)
Submit to: /api/contact
```

---

# 📚 FULL DOCUMENTATION BELOW

*(For AI assistants: Read this section for complete instructions on generating forms)*

---

## Instructions for AI

When the user asks you to create a form or dialog, follow this guide to generate all necessary files and code.

---

## 1. Dialog/Modal Form

### User Request Format:
```
Create a dialog for [purpose] with fields for [field1], [field2], [field3]...
The form should submit to [API endpoint].
```

### What to Create:

#### A. Form Definition File
**Location:** `/root/di2portal/frontend/src/formDefinitions/[name]FormDefinition.js`

```javascript
// Example: /root/di2portal/frontend/src/formDefinitions/userRegistrationFormDefinition.js

export const userRegistrationFormDefinition = {
  fields: [
    // Add fields based on user requirements
    // See example.md for all available field types
  ]
};
```

#### B. Dialog Component File
**Location:** `/root/di2portal/frontend/src/components/dialogs/[Name]Dialog.js`

**Template:**
```javascript
import { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DynamicForm from '../../lib/DynamicForm/DynamicForm';
import { [formName]FormDefinition } from '../../formDefinitions/[formName]FormDefinition';
import apiClient from '../../services/Interceptors';
import { toast } from 'react-hot-toast';

export default function [ComponentName]Dialog({ open, setOpen, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formValues) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('[API_ENDPOINT]', formValues);
      toast.success('[Success message]');
      setOpen(false);
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || '[Error message]');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              [Dialog Title]
            </DialogTitle>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form Content */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <DynamicForm
              formDefinition={[formName]FormDefinition}
              sendFormValues={handleSubmit}
              defaultValues={{}}
            >
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : '[Submit Button Text]'}
                </button>
              </div>
            </DynamicForm>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
```

#### C. Usage Example
Show the user how to use the dialog in their page:

```javascript
import { useState } from 'react';
import [ComponentName]Dialog from './components/dialogs/[ComponentName]Dialog';

function MyPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSuccess = (data) => {
    console.log('Form submitted successfully:', data);
    // Refresh data, update state, etc.
  };

  return (
    <div>
      <button onClick={() => setDialogOpen(true)} className="btn-primary">
        Open Form
      </button>

      <[ComponentName]Dialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
```

---

## 2. In-Page Form

### User Request Format:
```
Create an in-page form for [purpose] with fields for [field1], [field2], [field3]...
The form should submit to [API endpoint].
```

### What to Create:

#### A. Form Definition File
**Location:** `/root/di2portal/frontend/src/formDefinitions/[name]FormDefinition.js`

Same as dialog form definition.

#### B. Page Component with Embedded Form
**Location:** `/root/di2portal/frontend/src/pages/[Name]Page.js` or within existing component

**Template:**
```javascript
import { useState } from 'react';
import DynamicForm from '../lib/DynamicForm/DynamicForm';
import { [formName]FormDefinition } from '../formDefinitions/[formName]FormDefinition';
import apiClient from '../services/Interceptors';
import { toast } from 'react-hot-toast';

export default function [ComponentName]Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formValues) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('[API_ENDPOINT]', formValues);
      toast.success('[Success message]');
      // Handle success (redirect, update state, etc.)
    } catch (error) {
      toast.error(error.response?.data?.message || '[Error message]');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">[Page Title]</h1>
          <p className="mt-1 text-sm text-gray-500">[Description]</p>
        </div>

        {/* Form */}
        <div className="px-6 py-6">
          <DynamicForm
            formDefinition={[formName]FormDefinition}
            sendFormValues={handleSubmit}
            defaultValues={{}}
          >
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : '[Submit Button Text]'}
              </button>
            </div>
          </DynamicForm>
        </div>
      </div>
    </div>
  );
}
```

---

## 3. Dynamic Fields from API

When fields need to be loaded from an API endpoint:

### Template:
```javascript
import { useState, useEffect } from 'react';
import DynamicForm from '../lib/DynamicForm/DynamicForm';
import apiClient from '../services/Interceptors';
import { toast } from 'react-hot-toast';

export default function [ComponentName]() {
  const [formDefinition, setFormDefinition] = useState({ fields: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFormFields();
  }, []);

  const loadFormFields = async () => {
    try {
      const response = await apiClient.get('[API_ENDPOINT]');
      const safeFacets = response.data || [];
      
      const dynamicFields = safeFacets.map((facet) => ({
        name: facet?.label || "unknown",
        label: facet?.title || "Unknown",
        type: "multiselect",
        options: Array.isArray(facet.lists)
          ? facet.lists.map((item) => ({
              label: `${item?.label || "Unknown"}`,
              value: item?.label || "",
            }))
          : [],
        required: false,
      }));

      setFormDefinition({ fields: dynamicFields });
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load form fields');
      setLoading(false);
    }
  };

  const handleSubmit = async (formValues) => {
    // Handle submission
  };

  if (loading) {
    return <div>Loading form...</div>;
  }

  return (
    <DynamicForm
      formDefinition={formDefinition}
      sendFormValues={handleSubmit}
      defaultValues={{}}
    >
      <button type="submit" className="btn-primary">Submit</button>
    </DynamicForm>
  );
}
```

---

## 4. Required Information from User

When a user requests a form, ask for:

### Essential:
1. **Form Purpose** - What is this form for?
2. **Fields Needed** - List of fields (name, type, validation)
3. **API Endpoint** - Where to submit (POST/PUT/PATCH)
4. **Submit Button Text** - e.g., "Create User", "Update Profile"

### Optional:
5. **Default Values** - Any pre-filled data?
6. **Success Action** - What happens after submission? (redirect, refresh, close dialog)
7. **Error Handling** - Custom error messages?
8. **Conditional Fields** - Fields that show/hide based on other values?
9. **Custom Validation** - Special validation rules?
10. **Form Layout** - Card styling, colors, sections?

---

## 5. Field Type Quick Reference

Use these types when creating form definitions:

- `input` - Text input
- `email` - Email input
- `textarea` - Multi-line text
- `select` - Dropdown (single choice)
- `multiselect` - Dropdown (multiple choice)
- `checkbox` - Single checkbox
- `radiogroup` - Radio buttons
- `date` - Date picker
- `dateRange` - Date range picker
- `time` - Time picker
- `dayTimePicker` - Date + Time picker
- `file` - File upload
- `multifile` - Multiple file upload
- `header` - Section header
- `alert` - Alert message (info/success/warning/error)
- `linebreak` - Visual spacing
- `hidden` - Hidden field
- `litertext` - HTML content

See `example.md` for detailed documentation of each field type.

---

## 6. Common Patterns

### Pattern 1: Form with Sections
```javascript
{
  fields: [
    { type: 'header', label: 'Section 1', size: 'xl', underline: true },
    { type: 'alert', variant: 'info', message: 'Fill out all required fields' },
    { name: 'field1', label: 'Field 1', type: 'input', required: true },
    { name: 'field2', label: 'Field 2', type: 'email', required: true },
    
    { type: 'linebreak' },
    
    { type: 'header', label: 'Section 2', size: 'xl', underline: true },
    { name: 'field3', label: 'Field 3', type: 'textarea' },
  ]
}
```

### Pattern 2: Conditional Fields
```javascript
{
  fields: [
    { name: 'hasAddress', label: 'Has Address?', type: 'checkbox' },
    {
      name: 'address',
      label: 'Address',
      type: 'input',
      showIf: (values) => values.hasAddress === true
    }
  ]
}
```

### Pattern 3: Dependent Dropdowns
```javascript
{
  fields: [
    { name: 'country', label: 'Country', type: 'select', options: [...] },
    {
      name: 'state',
      label: 'State',
      type: 'select',
      optionsUrl: '/api/states',
      dependsOn: 'country'
    }
  ]
}
```

### Pattern 4: Card Styling
```javascript
{
  fields: [
    {
      name: 'agreeTerms',
      label: 'I agree to terms',
      type: 'checkbox',
      layout: 'inline',
      containerStyle: 'card',
      color: 'blue',
      description: 'By checking this, you agree to our terms'
    }
  ]
}
```

---

## 7. File Structure

When creating a form, organize files like this:

```
src/
├── formDefinitions/
│   └── userRegistrationFormDefinition.js
├── components/
│   └── dialogs/
│       └── UserRegistrationDialog.js
├── pages/
│   └── UserRegistrationPage.js
└── services/
    └── Interceptors.js (already exists)
```

---

## 8. API Integration Pattern

**Always use:**
```javascript
import apiClient from '../../services/Interceptors';
```

**For GET requests:**
```javascript
const response = await apiClient.get('/api/endpoint');
```

**For POST requests:**
```javascript
const response = await apiClient.post('/api/endpoint', formValues);
```

**For PUT requests:**
```javascript
const response = await apiClient.put('/api/endpoint/id', formValues);
```

**For DELETE requests:**
```javascript
const response = await apiClient.delete('/api/endpoint/id');
```

---

## 9. Example User Request & AI Response

### User Says:
```
Create a dialog form for user registration with fields for:
- Full Name (required)
- Email (required)  
- Phone Number
- Country (dropdown)
- Terms and Conditions checkbox

Submit to /api/users/register
```

### AI Should:
1. Create `/root/di2portal/frontend/src/formDefinitions/userRegistrationFormDefinition.js`
2. Create `/root/di2portal/frontend/src/components/dialogs/UserRegistrationDialog.js`
3. Provide usage example
4. Explain what was created

---

## 10. Checklist for AI

Before responding to a form request, ensure:

- [ ] Asked for all required information (purpose, fields, endpoint)
- [ ] Created form definition file in correct location
- [ ] Created dialog/page component with proper imports
- [ ] Used `apiClient` for API calls
- [ ] Added proper error handling with toast messages
- [ ] Included loading states for submit button
- [ ] Added success callback/handler
- [ ] Used correct field types from example.md
- [ ] Provided usage example
- [ ] Explained file structure to user

---

## 11. Quick Start Template

Copy this when user provides requirements:

**User Requirements:**
- Purpose: [USER INPUT]
- Fields: [USER INPUT]
- Endpoint: [USER INPUT]
- Type: [Dialog/In-Page]

**Files to Create:**
1. Form Definition: `/root/di2portal/frontend/src/formDefinitions/[name]FormDefinition.js`
2. Component: `/root/di2portal/frontend/src/components/dialogs/[Name]Dialog.js` OR `/root/di2portal/frontend/src/pages/[Name]Page.js`

**Next Steps:**
1. Create form definition with fields
2. Create component with API integration
3. Provide usage example
4. Test and iterate

---

## Notes

- All forms use DynamicForm component
- See `example.md` for complete field documentation
- Use toast for success/error messages
- Always include loading states
- Handle errors gracefully
- Validate required fields
- Use semantic field names (camelCase)
- Keep form definitions in separate files for reusability