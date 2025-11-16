import React, { useState } from "react";
import * as Popover from "@radix-ui/react-popover";

function TimeField({ field, formValues, handleChange, handleBlur, error }) {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState("12");
  const [minutes, setMinutes] = useState("00");
  const [period, setPeriod] = useState("PM");

  const value = formValues[field.name] || "";

  // Parse existing value if present
  React.useEffect(() => {
    if (value) {
      const timeMatch = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (timeMatch) {
        setHours(timeMatch[1].padStart(2, "0"));
        setMinutes(timeMatch[2]);
        setPeriod(timeMatch[3].toUpperCase());
      }
    }
  }, [value]);

  const handleApply = () => {
    const timeString = `${hours}:${minutes} ${period}`;
    handleChange(field.name, timeString);
    setOpen(false);
  };

  const handleClear = () => {
    handleChange(field.name, "");
    setHours("12");
    setMinutes("00");
    setPeriod("PM");
  };

  const incrementHours = () => {
    const h = parseInt(hours);
    setHours(((h % 12) + 1).toString().padStart(2, "0"));
  };

  const decrementHours = () => {
    const h = parseInt(hours);
    setHours((h === 1 ? 12 : h - 1).toString().padStart(2, "0"));
  };

  const incrementMinutes = () => {
    const m = parseInt(minutes);
    setMinutes(((m + 5) % 60).toString().padStart(2, "0"));
  };

  const decrementMinutes = () => {
    const m = parseInt(minutes);
    setMinutes((m === 0 ? 55 : m - 5).toString().padStart(2, "0"));
  };

  return (
    <div>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            id={field.name}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className={`
              inline-flex items-center justify-between gap-2
              w-full h-9 rounded-md border bg-white
              px-3 py-2 text-sm font-normal shadow-sm
              hover:bg-gray-50 hover:text-gray-900
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-50
              ${error 
                ? "border-red-500 focus-visible:ring-red-500" 
                : "border-gray-300 focus-visible:ring-blue-500"}
            `}
          >
            {value ? (
              <span>{value}</span>
            ) : (
              <span className="text-gray-400">
                {field.placeholder || "Select time"}
              </span>
            )}

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-clock opacity-70"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
        </Popover.Trigger>

        <Popover.Content
          align="start"
          sideOffset={2}
          className="z-50 rounded-md border border-gray-200 bg-white p-4 shadow-md w-64"
        >
          <div className="flex flex-col gap-4">
            {/* Time picker */}
            <div className="flex items-center justify-center gap-2">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={incrementHours}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val === "" || (parseInt(val) >= 1 && parseInt(val) <= 12)) {
                      setHours(val.padStart(2, "0"));
                    }
                  }}
                  className="w-14 text-center text-2xl font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded py-2"
                  maxLength="2"
                />
                <button
                  type="button"
                  onClick={decrementHours}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>

              <span className="text-2xl font-semibold">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={incrementMinutes}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={minutes}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val === "" || (parseInt(val) >= 0 && parseInt(val) <= 59)) {
                      setMinutes(val.padStart(2, "0"));
                    }
                  }}
                  className="w-14 text-center text-2xl font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded py-2"
                  maxLength="2"
                />
                <button
                  type="button"
                  onClick={decrementMinutes}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>

              {/* AM/PM */}
              <div className="flex flex-col gap-1 ml-2">
                <button
                  type="button"
                  onClick={() => setPeriod("AM")}
                  className={`
                    px-3 py-1 text-sm font-medium rounded
                    ${
                      period === "AM"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                  `}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod("PM")}
                  className={`
                    px-3 py-1 text-sm font-medium rounded
                    ${
                      period === "PM"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                  `}
                >
                  PM
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-2 border-t border-gray-200 pt-3">
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900 h-9 px-4 py-2"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 py-2"
              >
                Done
              </button>
            </div>
          </div>
        </Popover.Content>
      </Popover.Root>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default TimeField;