import "./App.css";
import { useState } from "react";
import { DynamicForm } from "ynotsoft-dynamic-form";
import ExampleNormalPage from "./pages/ExampleNormalPage.jsx";
import ExampleDrawer from "./pages/ExampleDrawer.jsx";
import ExampleDialog from "./pages/ExampleDialog.jsx";

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="max-w-3xl w-full mx-auto mt-10">
      <div className="w-full max-w-4xl  mx-auto p-8 space-y-8">
        <h1 className="text-3xl font-bold">DynamicForm Example</h1>

        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => setDrawerOpen(true)}
          >
            Open Drawer Example
          </button>

          <button
            className="px-4 py-2 bg-purple-600 text-white rounded"
            onClick={() => setDialogOpen(true)}
          >
            Open Dialog Example
          </button>
        </div>

        <div className="bg-red-500">
          <ExampleNormalPage />
        </div>
        {drawerOpen && <ExampleDrawer onClose={() => setDrawerOpen(false)} />}
        {dialogOpen && <ExampleDialog onClose={() => setDialogOpen(false)} />}
      </div>
    </div>
  );
}
