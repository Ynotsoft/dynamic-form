# DynamicForm Component - Complete Field Reference

## Install and Development Setup (Bun Monorepo)

This project uses **Bun** as the package manager and **Vite** with custom path aliasing for Hot Module Replacement (HMR) in the monorepo workspace.

### 1\. Prerequisites

You **must** have **Bun** installed to manage dependencies and run development scripts.  
( <https://bun.com/docs/installation> )

> Can now use npm instead of bun </br>
> node ^v22.7.0 required

### 2\. Install Dependencies

From the root of the repository (`dynamic-form/`):

```bash
# Install all dependencies and create workspace symlinks using Bun
bun install
```

### 3\. Build the Library (Initial Setup)

Because the library's `package.json` entry points point to files in the `/dist` directory, you must run an initial build so the example app can resolve the dependency.

From the root of the repository:

```bash
npm run build    #runs: bun run --filter @ynotsoft/dynamic-form build
```

or you can use npm commands using the workspace (--workspace) flag and passing in the name of the package

```
npm run build --workspace ynotsoft-dynamic-form
```

### 4\. Start the Example App

Run the development server for the example application.

From the root of the repository:

```bash
npm run example  #runs: bun --filter example dev
```

or you can use npm commands using the workspace (--workspace) flag and passing in the name of the package

```
npm run dev --workspace ynotsoft-dynamic-form
```

> **IMPORTANT NOTE ON HMR (Hot Module Replacement):**
> If HMR fails for changes made in the `packages/dynamic-form-lib/` source code, ensure your `example-app/vite.config.js` has the necessary **Path Aliasing** configured to bypass the symlink watcher issue. This is configured to resolve HMR issues and is essential for local development.

### 5\. How to push changes

#### For Regular Development Changes:
```bash
# 1. Commit your changes
git add .
git commit -m "feat: your change description"

# 2. Create tag
git tag v1.0.[version-number]
```

#### For NPM Package Releases:
```bash
# 1. Update version in package.json (in packages/dynamic-form-lib/)
npm version patch   # for bug fixes (1.0.0 → 1.0.1)

# 2. Build the library
npm run build

# 3. Create and push version tag
git push origin v1.0.[version-number]   # Replace with your actual version

# 4. GitHub Actions will automatically publish to NPM
```

#### Version Management:
- **Single Source of Truth:** Version is maintained in `packages/dynamic-form-lib/package.json`
- **Git Tags:** Use format `v1.0.[version-number]` (matches package.json version with "v" prefix)
- **NPM Registry:** GitHub Actions reads git tag, strips "v" prefix, publishes as `1.0.[version-number]` to NPM
- **Auto-Sync:** Git tag version must match package.json version for successful deployment

**Quick Check:**
```bash
# Verify versions match before pushing
cat packages/dynamic-form-lib/package.json | grep version
git tag --list | tail -1
```

> **Note:** The GitHub Actions workflow automatically publishes to NPM when you push a version tag (e.g., `v1.0.[version-number]`). No manual `npm publish` required unless you are not logged into NPM already.

---

## Overview

The DynamicForm component provides a flexible, declarative way to build forms with various field types, validation, conditional logic, and styling options.

## Basic Usage

```javascript
import { DynamicForm } from "@ynotsoft/dynamic-form"; // Note the package name

const formDefinition = {
  fields: [
    // Field definitions here
  ],
};

<DynamicForm
  formDefinition={formDefinition}
  returnType= {false}
  defaultValues={{ name: "John Doe" }}
  sendFormValues={(values) => console.log(values)}
  onFieldsChange={(values) => console.log("Changed:", values)}
/>;
```

---

## Field Types

### 1\. Header Field

Used for section titles and form organization.

```javascript
{
  type: 'header',
  label: 'Personal Information',
  size: 'xl',              // 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  align: 'left',           // 'left' | 'center' | 'right'
  underline: true          // Boolean - adds bottom border
}
```

### 2\. Input Field

Standard text input with shadcn/ui styling.

```javascript
{
  name: 'fullName',
  label: 'Full Name',
  type: 'input',
  required: true,
  placeholder: 'Enter your name',
  value: 'John Doe',
  disabled: false,
  maxLength: 100,
  validate: (value) => {
    if (value.length < 2) return 'Name must be at least 2 characters';
    return null;
  }
}
```

### 3\. Email Field

Email input with validation and shadcn/ui styling.

```javascript
{
  name: 'email',
  label: 'Email Address',
  type: 'email',
  required: true,
  placeholder: 'you@example.com',
  value: 'john@example.com'
}
```

### 4\. TextArea Field

Multi-line text input.

```javascript
{
  name: 'description',
  label: 'Description',
  type: 'textarea',
  required: false,
  placeholder: 'Enter description...',
  rows: 4,
  maxLength: 500,
  showCharCount: true,
  value: 'Initial description'
}
```

### 5\. Select Field

Dropdown selection with single choice.

```javascript
{
  name: 'country',
  label: 'Country',
  type: 'select',
  required: true,
  value: 'us',
  options: [
    { value: '', label: 'Select a country' },
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' }
  ],
  // Dynamic options from API
  optionsUrl: '/api/countries',
  dependsOn: 'region'  // Reload when 'region' changes
}
```

### 6\. MultiSelect Field

Multiple selection dropdown.

```javascript
{
  name: 'interests',
  label: 'Interests',
  type: 'multiselect',
  required: true,
  value: ['sports', 'tech'],
  options: [
    { value: 'sports', label: 'Sports' },
    { value: 'music', label: 'Music' },
    { value: 'tech', label: 'Technology' },
    { value: 'travel', label: 'Travel' }
  ],
  validate: (value) => {
    if (value && value.length > 3) return 'Select up to 3 interests';
    return null;
  }
}
```

### 7\. Checkbox Field

Single checkbox with flexible layouts and card styling.

```javascript
{
  name: 'agreeTerms',
  label: 'I agree to terms',
  type: 'checkbox',
  required: true,
  value: false,
  description: 'By checking this, you agree to our terms and conditions',
    options: [
      { value: 'option1', label: 'Option 1', description: '' },
      { value: 'option2', label: 'Option 2', description: '' },
      { value: 'option3', label: 'Option 3', description: '' },
  // Layout options
  layout: 'inline',        // 'inline' | 'stacked' | 'default'

  // Card container styling
  containerStyle: 'card',  // Wraps in bordered card
  color: 'blue',           // 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'indigo' | 'gray' | 'pink' | 'orange'
}
```

**Checkbox Layouts:**

- `default`: Standard checkbox with label above
- `inline`: Checkbox and label side-by-side
- `stacked`: Checkbox, label, and description stacked vertically

### 8\. Radio Group Field

Single selection from multiple options using Radix UI.

```javascript
{
  name: 'paymentMethod',
  label: 'Payment Method',
  type: 'radiogroup',
  required: true,
  value: 'card',
  options: [
    { value: 'card', label: 'Credit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'bank', label: 'Bank Transfer' }
  ],

  // Layout options
  inline: true,            // Display options horizontally

  // Color variants
  color: 'blue',           // 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'indigo' | 'gray' | 'pink' | 'orange'

  // Card container styling
  containerStyle: 'card',
  color: 'green'
}
```

### 9\. Date Picker Field

Single date selection with shadcn/ui calendar.

```javascript
{
  name: 'birthDate',
  label: 'Birth Date',
  type: 'date',
  required: true,
  placeholder: 'Select date',
  value: new Date('1990-01-01')
}
```

**Features:**

- Year/month dropdown selectors
- Clear and Done buttons
- Blue highlight for selected date
- Popover interface

### 10\. Date Range Picker Field

Select date ranges (from/to).

```javascript
{
  name: 'projectDates',
  label: 'Project Timeline',
  type: 'dateRange',
  required: true,
  placeholder: 'Select date range',
  value: {
    from: new Date('2025-01-01'),
    to: new Date('2025-12-31')
  }
}
```

### 11\. Time Field

Time picker with AM/PM selection.

```javascript
{
  name: 'appointmentTime',
  label: 'Appointment Time',
  type: 'time',
  required: true,
  placeholder: 'Select time',
  value: '03:45 PM'
}
```

**Features:**

- Hour/minute spinners
- AM/PM toggle buttons
- Clear and Done buttons
- Format: "HH:MM AM/PM"

### 12\. Date Time Picker Field

Combined date and time selection.

```javascript
{
  name: 'meetingDateTime',
  label: 'Meeting Date & Time',
  type: 'dayTimePicker',
  required: true,
  value: new Date('2025-10-17T15:30:00')
}
```

### 13\. File Upload Field

Single or multiple file uploads.

```javascript
{
  name: 'documents',
  label: 'Upload Documents',
  type: 'file',           // or 'multifile' for multiple
  required: true,
  accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  maxSize: 5 * 1024 * 1024,  // 5 MB
  multiple: false
}
```

### 14\. Hidden Field

Store hidden values in the form.

```javascript
{
  name: 'userId',
  type: 'hidden',
  value: '12345'
}
```

### 15\. HTML/Literal Field

Display rich HTML content (non-editable).

```javascript
{
  type: 'litertext',
  content: '<div class="alert">Important notice here</div>'
}
```

### 16\. Alert Message Field

Display contextual alert messages with icons (info, success, warning, error).

```javascript
{
  type: 'alert',
  variant: 'info',         // 'info' | 'success' | 'warning' | 'error' | 'danger'
  message: 'This is an informational message'
}

// Success alert
{
  type: 'alert',
  variant: 'success',
  message: 'Your form was submitted successfully!'
}
// ... other variants omitted for brevity ...
```

### 17\. Line Break Field

Add visual spacing between sections.

```javascript
{
  type: "linebreak";
}
```

---

## Global Field Format Options

Apply consistent styling to all fields (except header, html, linebreak, hidden, alert):

```javascript
{
  name: 'email',
  label: 'Email',
  type: 'email',

  // Card container
  containerStyle: 'card',
  color: 'blue',           // Card border/accent color

  // Layout for checkbox/radio
  layout: 'inline',        // or 'stacked' | 'default'
  inline: true,            // For radio groups
}
```

---

## Advanced Features

### Conditional Display

Show/hide fields based on other values:

```javascript
{
  name: 'state',
  label: 'State',
  type: 'select',
  showIf: (values) => values.country === 'us',
  options: [...]
}
```

### Conditional Disable

Disable fields based on conditions:

```javascript
{
  name: 'billingAddress',
  label: 'Billing Address',
  type: 'input',
  disabled: (values) => values.sameAsShipping === true
}
```

### Custom Validation

Field-level validation functions:

```javascript
{
  name: 'password',
  label: 'Password',
  type: 'input',
  validate: (value) => {
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Must contain uppercase letter';
    if (!/[0-9]/.test(value)) return 'Must contain a number';
    return null;
  }
}
```

### Dynamic Options

Load options from API:

```javascript
{
  name: 'city',
  label: 'City',
  type: 'select',
  optionsUrl: '/api/cities',
  dependsOn: 'state',  // Reload when state changes
}
```

---

## Complete Example

```javascript
// ... formDefinition omitted for brevity ...

// Usage
<DynamicForm
  formDefinition={formDefinition}
  defaultValues={{
    fullName: "John Doe",
    email: "john@example.com",
    contactMethod: "email",
  }}
  sendFormValues={(values) => {
    console.log("Form submitted:", values);
  }}
  onFieldsChange={(values) => {
    console.log("Form changed:", values);
  }}
/>
```

---

## Styling Reference

### Card Container Colors

Available for `containerStyle='card'`:

- `green` - Green border and accent
- `blue` - Blue border and accent
- `red` - Red border and accent
- `yellow` - Yellow border and accent
- `purple` - Purple border and accent
- `indigo` - Indigo border and accent
- `gray` - Gray border and accent
- `pink` - Pink border and accent
- `orange` - Orange border and accent

### Header Sizes

- `sm` - Small header
- `md` - Medium header
- `lg` - Large header
- `xl` - Extra large (default)
- `2xl` - 2X large
- `3xl` - 3X large
- `4xl` - 4X large

### Layout Options (Checkbox/Radio)

- `default` - Standard vertical layout
- `inline` - Horizontal with label beside control
- `stacked` - Vertical with description below

---

## Props

### DynamicForm Props

- `formDefinition` - Object containing field definitions
- `defaultValues` - Initial form values
- `sendFormValues` - Callback when form is submitted
- `onFieldsChange` - Callback when any field changes
- `children` - Additional content (e.g., submit button)

---

## Notes

- All fields support `required`, `disabled`, `showIf` properties
- Fields are automatically validated on blur and submit
- Error messages display below invalid fields
- Form values are managed internally with React state
- shadcn/ui components used for consistent styling
