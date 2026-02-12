import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import type { FieldComponentProps, FieldRuntime, InputProps } from "@/types";

type DayTimePickerFieldType = FieldRuntime<InputProps>;

type Props = Omit<FieldComponentProps<Date | null, InputProps>, "field"> & {
	field: DayTimePickerFieldType;
};

function asDate(value: unknown): Date | null {
	if (!value) return null;

	if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

	if (typeof value === "string" || typeof value === "number") {
		const d = new Date(value);
		return Number.isNaN(d.getTime()) ? null : d;
	}

	return null;
}

function DayTimePickerField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
}: Props) {
	const [open, setOpen] = useState<boolean>(false);

	const name = field.name;

	const selected = useMemo(() => {
		const rawValue = formValues[name];
		return asDate(rawValue);
	}, [formValues, name]);

	const displayHours = selected
		? (selected.getHours() % 12 || 12).toString().padStart(2, "0")
		: "12";

	const displayMinutes = selected
		? selected.getMinutes().toString().padStart(2, "0")
		: "00";

	const displayPeriod = selected
		? selected.getHours() >= 12
			? "PM"
			: "AM"
		: "PM";

	const handleSelect = (date: Date | undefined) => {
		if (!date) {
			handleChange(name, null);
			return;
		}

		const newDate = new Date(date);

		if (selected) {
			newDate.setHours(selected.getHours());
			newDate.setMinutes(selected.getMinutes());
		} else {
			newDate.setHours(12);
			newDate.setMinutes(0);
		}

		handleChange(name, newDate);
	};

	const updateTime = (h: string, m: string, p: "AM" | "PM") => {
		const date = selected ? new Date(selected) : new Date();

		let hours = Number.parseInt(h, 10);
		if (Number.isNaN(hours)) hours = 12;

		if (p === "PM" && hours !== 12) hours += 12;
		if (p === "AM" && hours === 12) hours = 0;

		const minutes = Number.parseInt(m, 10);
		date.setHours(hours);
		date.setMinutes(Number.isNaN(minutes) ? 0 : minutes);

		handleChange(name, date);
	};

	const incrementHours = () => {
		let h = Number.parseInt(displayHours, 10);
		if (Number.isNaN(h)) h = 12;
		h = (h % 12) + 1;
		updateTime(h.toString(), displayMinutes, displayPeriod);
	};

	const decrementHours = () => {
		let h = Number.parseInt(displayHours, 10);
		if (Number.isNaN(h)) h = 12;
		h = h === 1 ? 12 : h - 1;
		updateTime(h.toString(), displayMinutes, displayPeriod);
	};

	const incrementMinutes = () => {
		let m = Number.parseInt(displayMinutes, 10);
		if (Number.isNaN(m)) m = 0;
		m = (m + 5) % 60;
		updateTime(displayHours, m.toString().padStart(2, "0"), displayPeriod);
	};

	const decrementMinutes = () => {
		let m = Number.parseInt(displayMinutes, 10);
		if (Number.isNaN(m)) m = 0;
		m = m === 0 ? 55 : m - 5;
		updateTime(displayHours, m.toString().padStart(2, "0"), displayPeriod);
	};

	const togglePeriod = () => {
		updateTime(
			displayHours,
			displayMinutes,
			displayPeriod === "AM" ? "PM" : "AM",
		);
	};

	const handleClear = () => handleChange(name, null);

	return (
		<div className="relative">
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
								{selected.toLocaleString()}
							</span>
						) : (
							<span className="text-primary group-hover:text-primary">
								{field.placeholder || "Select date and time"}
							</span>
						)}

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
							className="lucide lucide-calendar text-slate-400 group-hover:text-slate-600 transition-colors"
						>
							<rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
							<line x1="16" x2="16" y1="2" y2="6" />
							<line x1="8" x2="8" y1="2" y2="6" />
							<line x1="3" x2="21" y1="10" y2="10" />
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
									"bg-primary/75 text-primary-foreground hover:bg-primary hover:text-white focus:bg-primary focus:text-white rounded-md",
								today: "border-primary text-primary font-bold rounded-md",
								day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-primary hover:text-primary-foreground rounded-md transition-colors",
								chevron:
									"text-primary hover:text-primary-foreground hover:bg-primary/50 ",
							}}
						/>
					</div>

					{/* Time Picker */}
					<div className="border-t border-slate-100 p-4 bg-background">
						<div className="flex items-center justify-center gap-4">
							<div className="flex items-center gap-2">
								{/* Hours */}
								<div className="flex flex-col items-center gap-1">
									<button
										type="button"
										onClick={incrementHours}
										aria-label="Increase hours"
										title="Increase hours"
										className="p-1 h-6 w-6 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-all"
									>
										<svg
											aria-hidden="true"
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="m18 15-6-6-6 6" />
										</svg>
									</button>

									<div className="w-12 h-10 flex items-center justify-center bg-background border border-slate-200 rounded-lg text-lg font-semibold shadow-sm text-primary">
										{displayHours}
									</div>

									<button
										type="button"
										onClick={decrementHours}
										aria-label="Decrease hours"
										title="Decrease hours"
										className="p-1 h-6 w-6 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-all"
									>
										<svg
											aria-hidden="true"
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="m6 9 6 6 6-6" />
										</svg>
									</button>
								</div>

								<span className="text-xl font-medium text-slate-300 pb-1">
									:
								</span>

								{/* Minutes */}
								<div className="flex flex-col items-center gap-1">
									<button
										type="button"
										onClick={incrementMinutes}
										aria-label="Increase minutes"
										title="Increase minutes"
										className="p-1 h-6 w-6 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-all"
									>
										<svg
											aria-hidden="true"
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="m18 15-6-6-6 6" />
										</svg>
									</button>

									<div className="w-12 h-10 flex items-center justify-center bg-background border border-slate-200 rounded-lg text-lg font-semibold shadow-sm text-primary">
										{displayMinutes}
									</div>

									<button
										type="button"
										onClick={decrementMinutes}
										aria-label="Decrease minutes"
										title="Decrease minutes"
										className="p-1 h-6 w-6 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-all"
									>
										<svg
											aria-hidden="true"
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="m6 9 6 6 6-6" />
										</svg>
									</button>
								</div>
							</div>

							{/* Period */}
							<div className="flex flex-col gap-1 bg-background p-1 rounded-lg border border-slate-200 shadow-sm">
								<button
									type="button"
									onClick={() => displayPeriod !== "AM" && togglePeriod()}
									aria-label="Set period to AM"
									title="Set period to AM"
									className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
										displayPeriod === "AM"
											? "bg-primary text-primary-foreground"
											: "text-foreground hover:text-primary-foreground hover:bg-primary"
									}`}
								>
									AM
								</button>
								<button
									type="button"
									onClick={() => displayPeriod !== "PM" && togglePeriod()}
									aria-label="Set period to PM"
									title="Set period to PM"
									className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
										displayPeriod === "PM"
											? "bg-primary text-primary-foreground"
											: "text-foreground hover:text-primary-foreground hover:bg-primary"
									}`}
								>
									PM
								</button>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex items-center justify-between gap-2 border-t border-slate-100 p-3 bg-background rounded-b-xl">
						<button
							type="button"
							onClick={handleClear}
							aria-label="Clear date and time"
							title="Clear date and time"
							className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary hover:text-primary-foreground hover:bg-slate-100 h-9 px-4 py-2"
						>
							Clear
						</button>
						<button
							type="button"
							onClick={() => setOpen(false)}
							aria-label="Done"
							title="Done"
							className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground shadow-sm h-9 px-6 py-2"
						>
							Done
						</button>
					</div>
				</PopoverContent>
			</Popover>

			{error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
		</div>
	);
}

export default DayTimePickerField;
