import { useEffect, useState } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import type {
	FieldComponentProps,
	FieldRuntime,
	FormValues,
	InputProps,
} from "@/types";

type TimeFieldType = FieldRuntime<InputProps> & {
	placeholder?: string;
};

type Props = Omit<FieldComponentProps<string, InputProps>, "field"> & {
	field: TimeFieldType;
	formValues: FormValues;
	error?: string | null;
};

function TimeField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
}: Props) {
	const [open, setOpen] = useState(false);
	const [hours, setHours] = useState("12");
	const [minutes, setMinutes] = useState("00");
	const [period, setPeriod] = useState<"AM" | "PM">("PM");

	const name = field.name;
	const value = (formValues[name] as string) ?? "";

	useEffect(() => {
		if (!value) return;

		const timeMatch = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
		if (!timeMatch) return;

		setHours(timeMatch[1].padStart(2, "0"));
		setMinutes(timeMatch[2]);
		setPeriod(timeMatch[3].toUpperCase() === "AM" ? "AM" : "PM");
	}, [value]);

	const handleApply = () => {
		const timeString = `${hours}:${minutes} ${period}`;
		handleChange(name, timeString);
		setOpen(false);
	};

	const handleClear = () => {
		handleChange(name, "");
		setHours("12");
		setMinutes("00");
		setPeriod("PM");
	};

	const incrementHours = () => {
		const h = Number.parseInt(hours, 10);
		const safe = Number.isNaN(h) ? 12 : h;
		setHours(((safe % 12) + 1).toString().padStart(2, "0"));
	};

	const decrementHours = () => {
		const h = Number.parseInt(hours, 10);
		const safe = Number.isNaN(h) ? 12 : h;
		setHours((safe === 1 ? 12 : safe - 1).toString().padStart(2, "0"));
	};

	const incrementMinutes = () => {
		const m = Number.parseInt(minutes, 10);
		const safe = Number.isNaN(m) ? 0 : m;
		setMinutes(((safe + 5) % 60).toString().padStart(2, "0"));
	};

	const decrementMinutes = () => {
		const m = Number.parseInt(minutes, 10);
		const safe = Number.isNaN(m) ? 0 : m;
		setMinutes((safe === 0 ? 55 : safe - 5).toString().padStart(2, "0"));
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
						onClick={() => setOpen(true)}
						onBlur={() => handleBlur(name)}
						className={`
							inline-flex items-center justify-between gap-2
							w-full h-9 rounded-md border bg-white
							px-3 py-2 text-sm font-normal shadow-sm
							hover:bg-gray-50 hover:text-gray-900
							focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
							disabled:cursor-not-allowed disabled:opacity-50
							${error ? "border-red-500 focus-visible:ring-red-500" : "border-gray-300 focus-visible:ring-blue-500"}
						`}
					>
						{value ? (
							<span>{value}</span>
						) : (
							<span className="text-gray-400">
								{field.placeholder || "Select time"}
							</span>
						)}

						{/* Decorative icon */}
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
							className="lucide lucide-clock opacity-70"
						>
							<circle cx="12" cy="12" r="10" />
							<polyline points="12 6 12 12 16 14" />
						</svg>
					</button>
				</PopoverTrigger>

				<PopoverContent
					align="start"
					sideOffset={2}
					className="z-50 rounded-md border border-gray-200 bg-white p-4 shadow-md w-64"
				>
					<div className="flex flex-col gap-4">
						<div className="flex items-center justify-center gap-2">
							{/* Hours */}
							<div className="flex flex-col items-center">
								<button
									type="button"
									onClick={incrementHours}
									aria-label="Increase hours"
									title="Increase hours"
									className="p-1 hover:bg-gray-100 rounded"
								>
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
									>
										<polyline points="18 15 12 9 6 15" />
									</svg>
								</button>

								<input
									type="text"
									inputMode="numeric"
									value={hours}
									onChange={(e) => {
										const digits = e.target.value.replace(/\D/g, "");
										if (digits === "") {
											setHours("");
											return;
										}
										const n = Number.parseInt(digits, 10);
										if (!Number.isNaN(n) && n >= 1 && n <= 12) {
											setHours(digits.padStart(2, "0"));
										}
									}}
									className="w-14 text-center text-2xl font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded py-2"
									maxLength={2}
									aria-label="Hours"
								/>

								<button
									type="button"
									onClick={decrementHours}
									aria-label="Decrease hours"
									title="Decrease hours"
									className="p-1 hover:bg-gray-100 rounded"
								>
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
									aria-label="Increase minutes"
									title="Increase minutes"
									className="p-1 hover:bg-gray-100 rounded"
								>
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
									>
										<polyline points="18 15 12 9 6 15" />
									</svg>
								</button>

								<input
									type="text"
									inputMode="numeric"
									value={minutes}
									onChange={(e) => {
										const digits = e.target.value.replace(/\D/g, "");
										if (digits === "") {
											setMinutes("");
											return;
										}
										const n = Number.parseInt(digits, 10);
										if (!Number.isNaN(n) && n >= 0 && n <= 59) {
											setMinutes(digits.padStart(2, "0"));
										}
									}}
									className="w-14 text-center text-2xl font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded py-2"
									maxLength={2}
									aria-label="Minutes"
								/>

								<button
									type="button"
									onClick={decrementMinutes}
									aria-label="Decrease minutes"
									title="Decrease minutes"
									className="p-1 hover:bg-gray-100 rounded"
								>
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
										${period === "AM" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
									`}
								>
									AM
								</button>
								<button
									type="button"
									onClick={() => setPeriod("PM")}
									className={`
										px-3 py-1 text-sm font-medium rounded
										${period === "PM" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
									`}
								>
									PM
								</button>
							</div>
						</div>

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
				</PopoverContent>
			</Popover>
		</div>
	);
}

export default TimeField;
