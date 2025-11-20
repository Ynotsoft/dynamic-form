import { CircleAlert, CircleCheck, CircleX, Info } from "lucide-react";

function ErrorAlert({ message }) {
  return (
    <div className="rounded-lg bg-red-50 border border-red-100 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <CircleX aria-hidden="true" className="size-5 text-red-500 shrink-0" />
        <span className="text-sm font-medium text-red-900">{message}</span>
      </div>
    </div>
  );
}
function WarningAlert({ message }) {
  return (
    <div className="rounded-lg bg-amber-50 border border-amber-100 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <CircleAlert
          aria-hidden="true"
          className="size-5 text-amber-600 shrink-0"
        />
        <span className="text-sm font-medium text-amber-900">{message}</span>
      </div>
    </div>
  );
}

function SuccessAlert({ message }) {
  return (
    <div className="rounded-lg bg-green-50 border border-green-100 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <CircleCheck
          aria-hidden="true"
          className="size-5 text-green-600 shrink-0"
        />
        <span className="text-sm font-medium text-green-900">{message}</span>
      </div>
    </div>
  );
}

function InfoAlert({ message }) {
  return (
    <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Info aria-hidden="true" className="size-5 text-blue-600 shrink-0" />
        <span className="text-sm font-medium text-blue-900">{message}</span>
      </div>
    </div>
  );
}

export { ErrorAlert, SuccessAlert, WarningAlert, InfoAlert };

