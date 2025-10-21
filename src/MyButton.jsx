// src/MyButton.jsx
export default function MyButton({ children, onClick }) {
  return <button onClick={onClick}>{children}</button>;
}