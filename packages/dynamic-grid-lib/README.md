## Dynamic Grid for React

A lightweight, data-driven grid for React with built‑in filtering, sorting, pagination, exporting, and row selection. It renders from your API response (headers + records) and gives you slots to add actions and custom tools.

## Installation

```bash
npm install ynotsoft-dynamic-grid
```

Make sure to import the grid.css file into your main.css

```
@import "tailwindcss";
// import grid.css below
@import "ynotsoft-dynamic-grid/grid.css";

@theme {

  /* === PRIMARY === */
  --color-primary: oklch(0% 0.00 0);
  --color-primary-hover: #6c6c6c;
  --color-primary-foreground: white;

  /* === SECONDARY === */
  --color-secondary: oklch(0.85 0.05 250);
  --color-secondary-hover: oklch(0.8 0.06 250);
  --color-secondary-foreground: oklch(0.25 0.1 250);

    ...
}

```

Requirements:

- React 18+ (tested with React 19)
- An HTTP client you provide (Axios or a compatible wrapper) via the `apiClient` prop

> Important: frontend-only
>
> This package provides the grid UI only. Pagination, sorting, filtering, selection, and export depend on your server implementation. If your backend doesn’t accept the documented query params/body or doesn’t return the expected shape (headers, filters, records, totalCount), the UI will render but features like filters and pagination will not function.

## Quick start

```jsx
import { DynamicGrid as Grid } from "ynotsoft-dynamic-grid";

// Dummy products dataset returned by your server normally
const productsResponse = {
  headers: [
    {
      title: "Product ID",
      sortKey: "ProductID",
      display: false,
      field: "ProductID",
      isPrimaryKey: true,
    },
    {
      title: "Product Name",
      sortKey: "ProductName",
      display: true,
      field: "ProductName",
      isPrimaryKey: false,
    },
    {
      title: "Category",
      sortKey: "Category",
      display: true,
      field: "Category",
      isPrimaryKey: false,
    },
    {
      title: "In Stock",
      sortKey: "InStock",
      display: true,
      field: "InStock",
      isPrimaryKey: false,
    },
    {
      title: "Available Date",
      sortKey: "AvailableDate",
      display: true,
      field: "AvailableDate",
      isPrimaryKey: false,
    },
  ],
  filters: {
    ProductName: {
      field: "ProductName",
      type: "Text",
      title: "Product Name",
      source: {},
    },
    Category: {
      field: "Category",
      type: "Text",
      title: "Category",
      source: {},
    },
    InStock: {
      field: "InStock",
      type: "Checkbox",
      title: "In Stock",
      source: { 1: "Yes", 2: "No" },
    },
    AvailableDate: {
      field: "AvailableDate",
      type: "Date",
      title: "Available Date",
      source: {},
    },
  },
  enableCheckbox: true,
  records: [
    {
      ProductID: 1,
      ProductName: "Wireless Mouse",
      Category: "Accessories",
      InStock: true,
      AvailableDate: "2024-03-01",
    },
    {
      ProductID: 2,
      ProductName: "USB-C Hub",
      Category: "Accessories",
      InStock: false,
      AvailableDate: "2024-03-10",
    },
  ],
  totalCount: 2,
};

// Simple mock client implementing the axios-like post(url, body) API
const apiClient = {
  post: async (_url, _body) => ({ data: productsResponse }),
};

export default function Example() {
  return (
    <Grid
      apiUrl="/products" // just a label used for building the request URL
      apiClient={apiClient} // your HTTP client (mocked here)
      pageLength={10}
      onSelectedRows={(ids) => console.log("Selected IDs", ids)}
    >
      {/* Optional: a button rendered in the top-right toolbar */}
      <button
        className="btn outline"
        onClick={() => console.log("Create Product")}
      >
        Create Product
      </button>

      {/* Optional action column rendered for each row */}
      <Grid.Action>
        {(record) => (
          <div className="flex gap-2">
            <button
              className="btn outline"
              onClick={() => console.log("View", record)}
            >
              View
            </button>
            <button
              className="btn destructive"
              onClick={() => console.log("Delete", record)}
            >
              Delete
            </button>
          </div>
        )}
      </Grid.Action>

      {/* Optional bulk actions bar shown when rows are selected */}
      <Grid.SelectedActions>
        {(selectedIds) => (
          <button
            className="btn destructive"
            onClick={() => console.log("Bulk delete", selectedIds)}
          >
            Delete {selectedIds.length}
          </button>
        )}
      </Grid.SelectedActions>
    </Grid>
  );
}
```

### Examples

All examples below reuse `productsResponse` and `apiClient` from the Quick start.

#### Example: top-right toolbar buttons (Children)

```jsx
import { DynamicGrid as Grid } from "ynotsoft-dynamic-grid";

export default function ToolbarExample() {
  return (
    <Grid apiUrl="/products" apiClient={apiClient} pageLength={10}>
      {/* Any non-special child renders on the top-right toolbar */}
      <button
        className="btn outline"
        onClick={() => console.log("Add product")}
      >
        Add product
      </button>
      <button className="btn outline" onClick={() => console.log("Refresh")}>
        Refresh
      </button>
    </Grid>
  );
}
```

#### Example: per-row actions column (Grid.Action)

```jsx
import { DynamicGrid as Grid } from "ynotsoft-dynamic-grid";

export default function ActionColumnExample() {
  return (
    <Grid apiUrl="/products" apiClient={apiClient} pageLength={10}>
      <Grid.Action>
        {(record) => (
          <div className="flex gap-2">
            <button
              className="btn outline"
              onClick={() => console.log("Edit", record)}
            >
              Edit
            </button>
            <button
              className="btn destructive"
              onClick={() => console.log("Delete", record)}
            >
              Delete
            </button>
          </div>
        )}
      </Grid.Action>
    </Grid>
  );
}
```

#### Example: in-line filter fields (Grid.Filter)

#### Example: custom cell renderer (Grid.Field)

```jsx
import FilterBuilder from "@/DynamicGrid/FilterBuilder";

const Filters = FilterBuilder;

export default function CustomFieldExample() {
  return (
    <Grid apiUrl="/products" apiClient={apiClient} pageLength={10}>
      {/* Render ProductName in bold and show Category in the tooltip */}
      <Grid.Filters fieldClass="p-4 rounded-md mb-4" type="inline">
        <Filters.Field name="Name" fieldClass="col-span-12" />
        <Filters.Field name="IsEnabledFlag" fieldClass="col-span-6" />
        <Filters.Field
          name="Date"
          fieldClass="col-span-12"
          includeTime={true}
        />
      </Grid.Filters>
    </Grid>
  );
}
```

#### Example: bulk actions bar (Grid.SelectedActions)

```jsx
import { DynamicGrid as Grid } from "ynotsoft-dynamic-grid";

export default function SelectedActionsExample() {
  return (
    <Grid apiUrl="/products" apiClient={apiClient} pageLength={10}>
      <Grid.SelectedActions>
        {(selectedIds) => (
          <div className="flex gap-2">
            <button
              className="btn destructive"
              onClick={() => console.log("Bulk delete", selectedIds)}
            >
              Delete {selectedIds.length}
            </button>
            <button
              className="btn outline"
              onClick={() => console.log("Export selected", selectedIds)}
            >
              Export selected
            </button>
          </div>
        )}
      </Grid.SelectedActions>
    </Grid>
  );
}
```

## Data contract (server response)

Dynamic Grid calls your API with POST requests and expects a JSON payload shaped like this:

```json
{
  "headers": [
    {
      "title": "Product ID",
      "sortKey": "ProductID",
      "display": false,
      "field": "ProductID",
      "isPrimaryKey": true
    },
    {
      "title": "Product Name",
      "sortKey": "ProductName",
      "display": true,
      "field": "ProductName",
      "isPrimaryKey": false
    },
    {
      "title": "Category",
      "sortKey": "Category",
      "display": true,
      "field": "Category",
      "isPrimaryKey": false
    },
    {
      "title": "In Stock",
      "sortKey": "InStock",
      "display": true,
      "field": "InStock",
      "isPrimaryKey": false
    },
    {
      "title": "Available Date",
      "sortKey": "AvailableDate",
      "display": true,
      "field": "AvailableDate",
      "isPrimaryKey": false
    }
  ],
  "filters": {
    "ProductName": {
      "field": "ProductName",
      "type": "Text",
      "title": "Product Name",
      "source": {}
    },
    "Category": {
      "field": "Category",
      "type": "Text",
      "title": "Category",
      "source": {}
    },
    "InStock": {
      "field": "InStock",
      "type": "Checkbox",
      "title": "In Stock",
      "source": { "1": "Yes", "2": "No" }
    },
    "AvailableDate": {
      "field": "AvailableDate",
      "type": "Date",
      "title": "Available Date",
      "source": {}
    }
  },
  "enableCheckbox": true,
  "records": [
    {
      "ProductID": 1,
      "ProductName": "Wireless Mouse",
      "Category": "Accessories",
      "InStock": true,
      "AvailableDate": "2024-03-01"
    },
    {
      "ProductID": 2,
      "ProductName": "USB-C Hub",
      "Category": "Accessories",
      "InStock": false,
      "AvailableDate": "2024-03-10"
    }
  ],
  "totalCount": 2
}
```

Notes:

- If `enableCheckbox` is true, exactly one header must have `isPrimaryKey: true` so the grid can track selected rows.
- The grid supports an alternative envelope. If your API returns `{ list: { ...above }, totalCount }`, it will still work.

## How the grid calls your API

- List: `POST {apiUrl}?page={pageIndex}&page_size={pageSize}&sort_key={sortKey}&sort_order={ASC|DESC}` with the current filters object as the request body.
- Export: `POST {apiUrl}?export=csv` with the current filters object. Expected response: `{ file: "https://download-url" }`.

Your `apiClient` only needs a `post(url, body)` method that returns `{ data: any }` or `any`. Axios works out of the box.

## Features at a glance

- Columns from your `headers` array (hide any with `display: false`).
- Sorting by clicking on a column whose header includes `sortKey`.
- Filters UI driven entirely by your `filters` object.
  - Text: operators = contains | equals | starts with
  - Date: operator = between (start–end)
  - Checkbox: operator = in (multi-select)
- Pagination with selectable page size (10, 50, 100, 200, 500).
- Row selection when `enableCheckbox` is true, with bulk actions slot.
- CSV export with your current filter applied.

## Props

- `apiUrl` (string, required): Base endpoint for list/export requests.
- `apiClient` (object, required): Axios-like client providing `post(url, body)`.
- `pageLength` (number, default 10): Initial page size.
- `refresh` (boolean, optional): Toggle to force a reload from outside.
- `setRefreshGrid` (fn, optional): Setter the grid calls to reset `refresh` to false.
- `onSelectedRows(ids: string[] | number[])` (fn, optional): Fired when selection changes.
- `children` (ReactNode, optional): Slots described below.

## Children (slots)

- Top toolbar: Any child that is not one of the special slots is rendered on the right side of the grid’s top bar.
- `<Grid.Action>{(record) => ReactNode}</Grid.Action>`: Renders an action cell per row.
- `<Grid.SelectedActions>{(selectedIds) => ReactNode}</Grid.SelectedActions>`: Renders a bulk actions bar when one or more rows are selected.

- `<Grid.Column name="FieldName">{(value, record) => ReactNode}</Grid.Column>`: Custom cell renderer for a specific field. Use this to override how a single column renders.

Tip: Keep action buttons minimal to avoid cramped layouts on small screens.

## Styling

Styling is bundled with the library and injected automatically; you don’t need Tailwind in your app. Utility classes are already included in the compiled CSS.

## Local development (contributing)

Start the example project for testing or development.

From the repo root:

```bash
npm i
npm run build
npm link
```

Link it into the example app and run it:

```bash
cd example
npm link ynotsoft-dynamic-grid
npm i
npm run dev
```

## FAQ

What does the request body look like for filters?

- The grid sends the current filter object you build via the UI, e.g. `{ JobName: { field, title, operator: "contains", value: "foo", displayValue: "foo" }, ... }`.

How do I reset the grid from outside?

- Maintain a `refresh` boolean in your parent component and pass `setRefreshGrid` so the grid can reset it after reloading.

Can I customize how a specific cell renders?

- The current release focuses on server‑defined headers and values, an actions column, and bulk actions. A dedicated custom cell slot is planned.

## License

MIT
