import React from "react";
import { Error, Success, Warning, Info } from "../components/formats/alerts/Alerts.jsx";

function AlertMessageField({ field }) {
  const { variant = "info", message, content } = field;

  const alertMessage = message || content || "";

  // Render based on variant type
  switch (variant.toLowerCase()) {
    case "error":
    case "danger":
      return <Error message={alertMessage} />;

    case "success":
      return <Success message={alertMessage} />;

    case "warning":
    case "warn":
      return <Warning message={alertMessage} />;

    case "info":
    case "information":
    default:
      return <Info message={alertMessage} />;
  }
}

export default AlertMessageField;