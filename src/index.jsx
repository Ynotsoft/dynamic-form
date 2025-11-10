// Automatically inject styles at runtime
import css from "./index.css?inline";

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.appendChild(style);
}

export { default as DynamicForm } from "./DynamicForm/DynamicForm.jsx";
import DynamicFormComponent from "./DynamicForm/DynamicForm.jsx";
export default DynamicFormComponent;
