// Named exports
export { default as MyButton } from './MyButton.jsx';
export { default as DynamicForm } from './DynamicForm/DynamicForm.jsx';

// Default exports for backward compatibility
import MyButtonComponent from './MyButton.jsx';
import DynamicFormComponent from './DynamicForm/DynamicForm.jsx';

// Export default as DynamicForm (main component)
export default DynamicFormComponent;

// Also export a default MyButton for direct import
export { MyButtonComponent, DynamicFormComponent };