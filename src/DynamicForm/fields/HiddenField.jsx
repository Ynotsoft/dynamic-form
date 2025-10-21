
// This component renders a hidden input field for forms. This used to include data in form submissions without displaying it to the user.
function HiddenField(field) {
  return <input type="hidden" name={field.name} value={field.value} key={field.name} />;
}
export default HiddenField;