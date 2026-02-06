import "./App.css";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ThemeToggle } from "./components/themeToggle.jsx";
import ExampleNormalPage from "./pages/ExampleNormalPage.jsx";
import ExampleDrawer from "./pages/ExampleDrawer.jsx";
import ExampleDialog from "./pages/ExampleDialog.jsx";
import ExampleGridPage from "./pages/ExampleGridPage.jsx"; // Importing the new component

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Router>
      <div className=" w-full mx-auto mt-10">
        <div className="w-full  mx-auto p-8 space-y-8">
          <h1 className="text-3xl font-bold">
            DynamicForm Example
            <ThemeToggle />
          </h1>

          <nav className="flex gap-4 mb-6">
            <Link
              to="/"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Normal Page
            </Link>
            <Link
              to="/grid"
              className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded"
            >
              Grid Page
            </Link>
          </nav>

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

          <hr className="my-6" />

          {/* Route Definitions */}
          <Routes>
            <Route path="/" element={<ExampleNormalPage />} />
            <Route path="/grid" element={<ExampleGridPage />} />
          </Routes>

          {/* Overlays (Drawer/Dialog) */}
          {drawerOpen && <ExampleDrawer onClose={() => setDrawerOpen(false)} />}
          {dialogOpen && <ExampleDialog onClose={() => setDialogOpen(false)} />}
        </div>
      </div>
    </Router>
  );
}
