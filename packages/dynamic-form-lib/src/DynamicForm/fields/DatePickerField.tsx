import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import type { FieldComponentProps, FieldRuntime, InputProps } from "@/types";

type DatePickerFieldType = FieldRuntime<InputProps>;

type Props = Omit<FieldComponentProps<Date | null, InputProps>, "field"> & {
	field: DatePickerFieldType;
	error?: string | null;
};

export default function DatePickerField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
}: Props) {
	const [open, setOpen] = useState(false);

	const name = field.name;
	const placeholder = field.placeholder;

	const selected = (formValues[name] as Date | null | undefined) ?? null;

	const handleSelect = (date: Date | undefined) => {
		handleChange(name, date ?? null);
	};

	const handleClear = () => handleChange(name, null);

	return (
		<div>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						type="button"
						id={name}
						aria-haspopup="dialog"
						aria-expanded={open}
						onClick={() => setOpen(true)}
						onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
						onBlur={() => handleBlur(name)}
						className={`
							group inline-flex items-center justify-between gap-2 text-primary-foreground
							w-full h-10 rounded-lg border  bg-background
							px-3 py-2 text-sm font-normal shadow-sm transition-all
							hover:border-slate-300 	
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
							disabled:cursor-not-allowed disabled:opacity-50
							${
								error
									? "border-red-500 focus-visible:ring-red-500"
									: "border-input focus-visible:ring-primary"
							}
						`}
					>
						{selected ? (
							<span className="text-primary group-hover:text-primary ">
								{selected.toLocaleDateString()}
							</span>
						) : (
							<span className="text-primary group-hover:text-primary ">
								{placeholder || "Select date"}
							</span>
						)}

						<svg
							aria-hidden="true"
							focusable="false"
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
					sideOffset={4}
					className="z-50 w-auto p-0 bg-background rounded-xl shadow-xl border border-input"
				>
					<div className="p-3">
						<DayPicker
							mode="single"
							selected={selected ?? undefined}
							onSelect={handleSelect}
							showOutsideDays
							className="p-0"
							classNames={{
								selected:
									"bg-primary/70 text-primary-foreground hover:bg-primary hover:text-white focus:bg-primary focus:text-white rounded-md",
								today:
									"bg-primary text-primary-foreground font-bold rounded-md",
								day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-primary hover:text-primary-foreground rounded-md transition-colors",
								chevron:
									"text-primary hover:text-primary-foreground hover:bg-primary/50 ",
							}}
						/>
					</div>

					{/* Actions */}
					<div className="flex items-center justify-between gap-2 border-t border-slate-100 p-3 bg-background rounded-b-xl">
						<button
							type="button"
							onClick={handleClear}
							className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary hover:text-primary-foreground hover:bg-slate-100 h-9 px-4 py-2"
						>
							Clear
						</button>
						<button
							type="button"
							onClick={() => setOpen(false)}
							className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground shadow-sm h-9 px-6 py-2"
						>
							Done
						</button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
