import React from "react";
import {
  ErrorAlert,
  SuccessAlert,
  WarningAlert,
  InfoAlert,
} from "@/components/ui/alerts";

function AlertMessageField({ field }) {
  const { variant = "info", message, content } = field;

  const alertMessage = message || content || "";

  // Render based on variant type
  switch (variant.toLowerCase()) {
    case "error":
    case "danger":
      return <ErrorAlert message={alertMessage} />;

    case "success":
      return <SuccessAlert message={alertMessage} />;

    case "warning":
    case "warn":
      return <WarningAlert message={alertMessage} />;

    case "info":
    case "information":
    default:
      return <InfoAlert message={alertMessage} />;
  }
}

export default AlertMessageField;
