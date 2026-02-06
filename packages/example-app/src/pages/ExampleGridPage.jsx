import { Grid } from "ynotsoft-dynamic-grid";
import FilterBuilder from "ynotsoft-dynamic-grid";

import axios from "axios";

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

export default function ExampleGridPage() {
  const token = "your_api_token_here"; // Replace with your actual token
  const apiClient = axios.create({
    baseURL: "/",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return (
    <div className="p-6  rounded shadow border">
      <h2 className="text-xl font-semibold mb-4">Grid Page Form</h2>
      <Grid
        apiUrl={`data.json`} // Also works with "/data.json"
        apiClient={apiClient}
        pageLength={10}
        showExportButton={true}
        noRecordsMessage="No applications in this environment"
        onSelectedRows={(selectedIds) => {
          console.log("Selected Application IDs:", selectedIds);
        }}
      >
        <Grid.Filters fieldClass="p-4 rounded-md mb-4" type="inline">
          <FilterBuilder.Field name="ProductName" fieldClass="col-span-6" />
          <FilterBuilder.Field name="ProductID" fieldClass="col-span-6" />
        </Grid.Filters>
      </Grid>
    </div>
  );
}
