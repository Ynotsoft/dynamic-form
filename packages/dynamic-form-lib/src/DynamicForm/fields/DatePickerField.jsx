import React, { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X, ChevronDown } from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import "react-day-picker/dist/style.css";

function DatePickerField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
	disabled,
	...props
}) {
	const getValidDate = (value) => {
		if (!value) return null;
		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	};

	const [open, setOpen] = useState(false);
	const isDisabled = disabled;
	const selected = getValidDate(formValues[field.name]);
	const [displayMonth, setDisplayMonth] = useState(selected || new Date());
	const errorId = props["aria-describedby"];

	useEffect(() => {
		if (open) {
			setDisplayMonth(selected || new Date());
		}
	}, [open, selected]);

	const disabledDays = [];
	if (field.maxDate) {
		disabledDays.push({ after: new Date(field.maxDate) });
	}
	if (field.minDate) {
		disabledDays.push({ before: new Date(field.minDate) });
	}

	const handleSelect = (date) => {
		handleChange(field.name, date || null);
		if (date) setDisplayMonth(date);
		if (field.closeOnSelect !== false) setOpen(false); // Default to close
		handleBlur(field.name);
	};

	const handleToday = () => {
		const today = new Date();
		handleChange(field.name, today);
		setDisplayMonth(today);
		if (field.closeOnSelect !== false) setOpen(false);
		handleBlur(field.name);
	};

	const handleClear = (e) => {
		e.preventDefault();
		e.stopPropagation(); // Critical: prevents the popover from opening/closing
		handleChange(field.name, null);
		setDisplayMonth(new Date());
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
					{/* FIX: Changed from <button> to <div> to allow the nested clear button.
						Added role and tabIndex to maintain accessibility (WCAG 2.1).
					*/}
					<div
						role="combobox"
						aria-expanded={open}
						aria-haspopup="dialog"
						aria-controls={field.name + "-calendar"}
						tabIndex={isDisabled ? -1 : 0}
						onClick={() => !isDisabled && setOpen(true)}
						onKeyDown={(e) => {
							if (isDisabled) return;
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								setOpen(true);
							}
						}}
						className={`
							flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm 
							transition-all outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2
							${isDisabled ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50" : "bg-background text-foreground hover:border-primary/50 cursor-pointer"}
							${error ? "border-destructive focus-within:ring-destructive" : "border-input"}
						`}
					>
						<div className="flex items-center gap-2 overflow-hidden pointer-events-none">
							<CalendarIcon
								className={`h-4 w-4 shrink-0 ${error ? "text-destructive" : "text-muted-foreground"}`}
								aria-hidden="true"
							/>
							{selected ? (
								<span className="truncate">{format(selected, "PPP")}</span>
							) : (
								<span className="text-muted-foreground truncate">
									{field.placeholder || "Pick a date"}
								</span>
							)}
						</div>

						<div className="flex items-center gap-1">
							{selected && !isDisabled && (
								<button
									type="button"
									aria-label="Clear selected date"
									onClick={handleClear}
									className="p-1 hover:bg-muted rounded-full transition-colors focus-visible:ring-1 focus-visible:ring-ring outline-none relative z-10"
								>
									<X
										className="h-3.5 w-3.5 text-muted-foreground"
										aria-hidden="true"
									/>
								</button>
							)}
							<ChevronDown
								className={`h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
								aria-hidden="true"
							/>
						</div>
					</div>
				</PopoverTrigger>

				<PopoverContent
					align="start"
					sideOffset={4}
					className="z-50 w-auto p-0 bg-popover border border-border rounded-lg shadow-xl"
				>
					<div className="p-3">
						<DayPicker
							mode="single"
							selected={selected}
							month={displayMonth}
							onMonthChange={setDisplayMonth}
							onSelect={handleSelect}
							showOutsideDays
							disabled={disabledDays}
							classNames={{
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

					<div className="flex items-center justify-between gap-2 border-t border-border p-3 bg-muted/20">
						<button
							type="button"
							onClick={handleToday}
							className="text-xs font-medium px-4 py-2 rounded-md border border-input bg-background hover:bg-muted transition-all focus-visible:ring-2 focus-visible:ring-ring"
						>
							Today
						</button>
						<button
							type="button"
							onClick={() => setOpen(false)}
							className="text-xs font-medium px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-all focus-visible:ring-2 focus-visible:ring-ring"
						>
							Done
						</button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export default DatePickerField;
