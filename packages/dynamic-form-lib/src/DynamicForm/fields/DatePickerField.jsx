import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
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
	const [open, setOpen] = useState(false);
	const isDisabled = disabled;
	const selected = formValues[field.name]
		? new Date(formValues[field.name])
		: null;
	const errorId = props["aria-describedby"];

	const handleSelect = (date) => {
		handleChange(field.name, date);
		if (field.closeOnSelect) setOpen(false);
		handleBlur(field.name);
	};

	const handleClear = (e) => {
		e.preventDefault();
		e.stopPropagation();
		handleChange(field.name, null);
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
						disabled={isDisabled}
						aria-haspopup="dialog"
						aria-expanded={open}
						aria-invalid={!!error}
						aria-describedby={error ? errorId : undefined}
						className={`
							flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm 
							transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
							${isDisabled ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50" : "bg-background text-foreground hover:border-primary/50"}
							${error ? "border-destructive focus-visible:ring-destructive" : "border-input"}
						`}
					>
						<div className="flex items-center gap-2 overflow-hidden">
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
									className="p-1 hover:bg-muted rounded-full transition-colors focus-visible:ring-1 focus-visible:ring-ring outline-none"
								>
									<X
										className="h-3.5 w-3.5 text-muted-foreground"
										aria-hidden="true"
									/>
								</button>
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
								className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
								aria-hidden="true"
							>
								<path d="m6 9 6 6 6-6" />
							</svg>
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
							mode="single"
							selected={selected}
							onSelect={handleSelect}
							showOutsideDays
							className="m-0"
							classNames={{
								day_selected:
									"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
								day_today: "bg-accent text-accent-foreground font-bold",
								day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-md transition-colors",
								nav_button:
									"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-input rounded-md flex items-center justify-center",
								caption: "flex justify-center pt-1 relative items-center mb-2",
								caption_label: "text-sm font-medium",
							}}
						/>
					</div>

					<div className="flex items-center justify-between gap-2 border-t border-border p-3 bg-muted/20">
						<button
							type="button"
							onClick={handleClear}
							className="text-xs font-medium px-3 py-1.5 rounded-md border border-input bg-background hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring"
						>
							Clear
						</button>
						<button
							type="button"
							onClick={() => setOpen(false)}
							className="text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
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
