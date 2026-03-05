import React, { useState, useMemo } from "react"; // Added useMemo here
import { DayPicker } from "react-day-picker";
import { format, isValid } from "date-fns"; // Recommended for safe formatting
import { Calendar as CalendarIcon, X, ChevronDown } from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import "react-day-picker/dist/style.css";

function DateRangeField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
	disabled,
	...props
}) {
	const [open, setOpen] = useState(false);
	const errorId = props["aria-describedby"];

	// 1. SAFE DATA PARSING
	const rawValue = formValues[field.name];
	const selected = useMemo(() => {
		const empty = { from: undefined, to: undefined };
		if (!rawValue) return empty;

		const parseDate = (d) => {
			const date = new Date(d);
			return isValid(date) ? date : undefined;
		};

		if (Array.isArray(rawValue)) {
			// If DynamicForm stores it as [{startDate, endDate}] or [Date, Date]
			const start = rawValue[0]?.startDate || rawValue[0];
			const end = rawValue[0]?.endDate || rawValue[1];
			return { from: parseDate(start), to: parseDate(end) };
		}

		return { from: parseDate(rawValue.from), to: parseDate(rawValue.to) };
	}, [rawValue]);

	const handleSelect = (range) => {
		const newValue = range || { from: undefined, to: undefined };
		handleChange(field.name, newValue);
	};

	const handleClear = (e) => {
		e.preventDefault();
		e.stopPropagation();
		handleChange(field.name, { from: undefined, to: undefined });
		handleBlur(field.name);
	};

	return (
		<div className="relative w-full">
			<Popover
				open={open}
				onOpenChange={(isOpen) => {
					setOpen(isOpen);
					if (!isOpen) handleBlur(field.name);
				}}
			>
				<PopoverTrigger asChild>
					<button
						type="button"
						id={field.name}
						disabled={disabled}
						aria-haspopup="dialog"
						aria-expanded={open}
						aria-invalid={!!error}
						aria-describedby={error ? errorId : undefined}
						className={`
							flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm 
							transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
							${disabled ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50" : "bg-background text-foreground hover:border-primary/50"}
							${error ? "border-destructive focus-visible:ring-destructive" : "border-input"}
						`}
					>
						<div className="flex items-center gap-2 overflow-hidden">
							<CalendarIcon
								className={`h-4 w-4 shrink-0 ${error ? "text-destructive" : "text-muted-foreground"}`}
								aria-hidden="true"
							/>
							<div className="truncate">
								{selected?.from ? (
									selected.to ? (
										<span>
											{format(selected.from, "PP")} -{" "}
											{format(selected.to, "PP")}
										</span>
									) : (
										<span>{format(selected.from, "PP")}</span>
									)
								) : (
									<span className="text-muted-foreground">
										{field.placeholder || "Select range"}
									</span>
								)}
							</div>
						</div>

						<div className="flex items-center gap-1">
							{selected?.from && !disabled && (
								<button
									type="button"
									aria-label="Clear selection"
									onClick={handleClear}
									className="p-1 hover:bg-muted rounded-full transition-colors focus-visible:ring-1 focus-visible:ring-ring outline-none"
								>
									<X
										className="h-3.5 w-3.5 text-muted-foreground"
										aria-hidden="true"
									/>
								</button>
							)}
							<ChevronDown
								className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
								aria-hidden="true"
							/>
						</div>
					</button>
				</PopoverTrigger>

				<PopoverContent
					align="start"
					sideOffset={4}
					className="z-50 w-auto p-0 bg-popover border border-border rounded-lg shadow-xl"
				>
					<div className="p-3">
						<DayPicker
							mode="range"
							selected={selected}
							onSelect={handleSelect}
							showOutsideDays
							classNames={{
								day_range_start:
									"bg-primary text-primary-foreground rounded-l-md",
								day_range_end:
									"bg-primary text-primary-foreground rounded-r-md",
								day_range_middle: "bg-primary/20 text-foreground !rounded-none",
								day_selected:
									"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
								day_today: "bg-accent text-accent-foreground font-bold",
								day: "h-9 w-9 p-0 font-normal hover:bg-muted rounded-md transition-colors",
								nav_button:
									"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-input rounded-md flex items-center justify-center",
								caption_label: "text-sm font-medium",
							}}
						/>
					</div>
					<div className="flex items-center justify-end gap-2 border-t border-border p-3 bg-muted/20">
						<button
							type="button"
							onClick={() => setOpen(false)}
							className="text-xs font-medium px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
						>
							Done
						</button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export default DateRangeField;
