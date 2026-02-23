import { useState, useMemo, type KeyboardEvent } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import type { FieldComponentProps, FieldRuntime, InputProps } from "@/types";

const EMPTY_RANGE: DateRange = { from: undefined, to: undefined };

type DateRangePickerFieldType = FieldRuntime<InputProps>;

type Props = Omit<FieldComponentProps<DateRange, InputProps>, "field"> & {
	field: DateRangePickerFieldType;
	error?: string | null;
};

function DateRangePickerField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
	disabled,
}: Props) {
	const [open, setOpen] = useState(false);

	const name = field.name;

	const isDisabled =
		typeof field.disabled === "function"
			? field.disabled(formValues)
			: (disabled ?? !!field.disabled);

	const selected = (formValues[name] as DateRange | undefined) ?? EMPTY_RANGE;

	const formattedDate = useMemo(() => {
		if (!selected.from) return field.placeholder || "Select date range";
		if (!selected.to) return format(selected.from, "PPP");
		return `${format(selected.from, "PPP")} – ${format(selected.to, "PPP")}`;
	}, [selected, field.placeholder]);

	const handleSelect = (range: DateRange | undefined) => {
		handleChange(name, range ?? EMPTY_RANGE);
		handleBlur(name);
		setOpen(false);
	};

	const handleClear = () => {
		handleChange(name, EMPTY_RANGE);
		handleBlur(name);
	};

	return (
		<div>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						type="button"
						id={name}
						aria-haspopup="dialog"
						aria-expanded={open}
						aria-invalid={!!error}
						aria-describedby={error ? `${name}-error` : undefined}
						onClick={() => setOpen(true)}
						onBlur={() => handleBlur(name)}
						disabled={isDisabled}
						className={`
							inline-flex items-center justify-between gap-2
							w-full h-9 rounded-md border bg-white
							px-3 py-2 text-sm font-normal shadow-sm
							hover:bg-gray-50 hover:text-gray-900
							focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
							disabled:cursor-not-allowed disabled:opacity-50
							${
								error
									? "border-red-500 focus-visible:ring-red-500"
									: "border-gray-300 focus-visible:ring-blue-500"
							}
						`}
					>
						<span className={!selected.from ? "text-muted-foreground" : ""}>
							{formattedDate}
						</span>

						<svg
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="lucide lucide-chevron-down opacity-70"
						>
							<path d="m6 9 6 6 6-6" />
						</svg>
					</button>
				</PopoverTrigger>

				<PopoverContent
					align="start"
					sideOffset={2}
					className="z-50 rounded-md border border-gray-200 bg-white p-0 shadow-md w-auto"
				>
					<section aria-label="Date Range Picker Calendar">
						<DayPicker
							mode="range"
							selected={selected}
							onSelect={(range) => {
								handleChange(name, range ?? EMPTY_RANGE);
								handleBlur(name);
							}}
							showOutsideDays
							className="rounded-md bg-white p-3 text-xs"
						/>

						<div className="flex items-center justify-between gap-2 border-t border-gray-200 p-3">
							<button
								type="button"
								onClick={handleClear}
								disabled={isDisabled}
								className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900 h-9 px-4 py-2"
							>
								Clear
							</button>

							<button
								type="button"
								onClick={() => setOpen(false)}
								className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 py-2"
							>
								Done
							</button>
						</div>
					</section>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export default DateRangePickerField;
