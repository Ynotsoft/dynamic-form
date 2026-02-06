import { useState } from "react";
import FilterBuilder from "./FilterBuilder";

type GridMenuProps = {
	list: any;
	setFilter: React.Dispatch<React.SetStateAction<any>>;
	filter?: any;
	customFiltersRenderer?: {
		children?: React.ReactNode;
		fieldClass?: string;
	} | null;
};

function GridMenu({ list, setFilter, customFiltersRenderer }: GridMenuProps) {
	const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
	const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
	const [selectedFilter, setSelectedFilter] = useState<{
		header: string;
		type: string;
		operator?: string;
	} | null>(null);
	const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);
	const [localOperator, setLocalOperator] = useState("");
	const [localValue, setLocalValue] = useState<any>("");
	const [error, setError] = useState("");

	const searchForm = list?.filters || {};

	const textFieldOperators = [
		{ title: "contains" },
		{ title: "equals" },
		{ title: "starts with" },
	];

	const handleMainMenuClick = (header: string) => {
		const f = searchForm[header];
		setSelectedFilter({ header, type: f.type });

		if (f.type === "Text") {
			setLocalOperator(textFieldOperators[0].title);
			setLocalValue("");
		} else if (f.type === "Checkbox") {
			setSelectedCheckboxes([]);
		}
		setIsSubMenuOpen(true);
	};

	const handleClick = () => {
		if (selectedFilter && selectedFilter.header) {
			if (
				selectedFilter.type === "Date" &&
				(!localValue.startDate || !localValue.endDate)
			) {
				setError("Please select both start and end dates.");
				return;
			}
			if (
				selectedFilter.type === "Checkbox" &&
				selectedCheckboxes.length === 0
			) {
				setError("Please select at least one option.");
				return;
			}
			if (
				selectedFilter.type === "Text" &&
				(!localValue || String(localValue).trim() === "")
			) {
				setError("Please enter a value.");
				return;
			}

			setFilter(() => ({
				...searchForm,
				[selectedFilter.header]: {
					type: searchForm[selectedFilter.header].type,
					title: searchForm[selectedFilter.header].title,
					field: searchForm[selectedFilter.header].field,
					value:
						selectedFilter.type === "Date"
							? `${localValue.startDate} and ${localValue.endDate}`
							: selectedFilter.type === "Checkbox"
								? selectedCheckboxes || []
								: localValue,
					operator:
						selectedFilter.type === "Date"
							? selectedFilter.operator
								? selectedFilter.operator
								: "between"
							: selectedFilter.type === "Checkbox"
								? "in"
								: localOperator,
					source: searchForm[selectedFilter.header].source,
					displayValue:
						selectedFilter.type === "Date" &&
						localValue.startDate &&
						localValue.endDate
							? `${localValue.startDate} ${localValue.startTime || ""} to ${localValue.endDate} ${localValue.endTime || ""}`
							: selectedFilter.type === "Date" &&
									(localValue.startDate || localValue.endDate)
								? `${localValue.startDate} ${localValue.startTime || ""} ${localValue.endDate} ${localValue.endTime || ""}`
								: selectedFilter.type === "Checkbox"
									? selectedCheckboxes
											.map(
												(val) =>
													searchForm[selectedFilter.header].source?.[val],
											)
											.join(", ")
									: localValue,
				},
			}));
		}

		setIsSubMenuOpen(false);
		setIsMainMenuOpen(false);
		setLocalOperator("");
		setLocalValue("");
		setSelectedCheckboxes([]);
	};

	const handleCheckboxChange = (value: string) => {
		setSelectedCheckboxes((prev) =>
			prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
		);
	};

	const buttonFilterDisplay = (
		<div className="relative float-left flex pr-2">
			<button
				type="button"
				onClick={() => {
					setIsMainMenuOpen(!isMainMenuOpen);
					setIsSubMenuOpen(false);
					setSelectedFilter(null);
					setError("");
				}}
				className="btn order-1 primary"
			>
				<span className="text-white">+ Add Filters</span>
			</button>

			{isMainMenuOpen && (
				<div className="absolute z-10 mt-2 w-56 bg-white rounded-md shadow-lg ring-0 ring-black ring-opacity-10 top-full left-0">
					{Object.keys(searchForm).map((key) => (
						<button
							type="button"
							key={key}
							onClick={() => {
								handleMainMenuClick(key);
								setError("");
							}}
							className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${
								selectedFilter?.header === key ? "bg-indigo-100" : ""
							}`}
						>
							{searchForm[key].title || key}
						</button>
					))}
				</div>
			)}

			{isSubMenuOpen && (
				<div className="absolute ml-[227px] mt-4 w-60 bg-white rounded-md shadow-lg p-4 ring-0 ring-black ring-opacity-5 top-6">
					<div className="font-semibold mb-2">
						Filter: {searchForm[selectedFilter?.header || ""]?.title}
					</div>

					<div className="mb-0">
						{selectedFilter?.type === "Date" ? (
							<>
								<label
									htmlFor="start-date"
									className="block text-sm font-medium text-gray-700"
								>
									Start Date <span className="text-red-500">*</span>
								</label>
								<input
									type="date"
									value={localValue.startDate || ""}
									onChange={(e) =>
										setLocalValue((prev: any) => ({
											...prev,
											startDate: e.target.value,
										}))
									}
									className="mt-1 block w-full border border-gray-300 rounded-md p-2"
								/>

								<label
									htmlFor="end-date"
									className="block text-sm font-medium text-gray-700 mt-4"
								>
									End Date <span className="text-red-500">*</span>
								</label>
								<input
									type="date"
									value={localValue.endDate || ""}
									onChange={(e) =>
										setLocalValue((prev: any) => ({
											...prev,
											endDate: e.target.value,
										}))
									}
									className="mt-1 block w-full border border-gray-300 rounded-md p-2"
								/>
							</>
						) : selectedFilter?.type === "Checkbox" ? (
							<>
								<label
									htmlFor="options"
									className="block text-sm font-medium text-gray-700"
								>
									Options
								</label>
								<div className="mt-1 block border border-gray-300 rounded-md p-2">
									{searchForm[selectedFilter?.header || ""]?.source ? (
										Object.entries(
											searchForm[selectedFilter?.header || ""].source,
										).map(([key, option], index) => (
											<div
												key={index.toString()}
												className="flex items-center mb-2"
											>
												<input
													id={`checkbox-${index}`}
													name={`checkbox-${index}`}
													type="checkbox"
													value={key}
													onChange={(e) => handleCheckboxChange(e.target.value)}
													className="h-4 w-4 border-gray-300 rounded"
												/>
												<label
													className="ml-2 block text-sm font-medium text-gray-700"
													htmlFor={`checkbox-${index}`}
												>
													{String(option)}
												</label>
											</div>
										))
									) : (
										<p className="text-sm text-gray-500">
											No options available
										</p>
									)}
								</div>
							</>
						) : (
							<>
								<label
									htmlFor="condition"
									className="block text-sm font-medium text-gray-700"
								>
									Condition
								</label>
								<select
									onChange={(e) => setLocalOperator(e.target.value)}
									value={localOperator}
									className="mt-1 block w-full border border-gray-300 rounded-md p-2"
								>
									{textFieldOperators.map((operator, index) => (
										<option key={index.toString()} value={operator.title}>
											{operator.title}
										</option>
									))}
								</select>

								<label
									htmlFor="value"
									className="block text-sm font-medium text-gray-700 mt-4"
								>
									Value
								</label>
								<input
									type="text"
									value={localValue}
									onChange={(e) => setLocalValue(e.target.value)}
									className="mt-1 block w-full border border-gray-300 rounded-md p-2"
									placeholder="Enter value"
								/>
							</>
						)}
					</div>

					{error && <div className="text-red-500 text-sm mb-4">{error}</div>}

					<div className="flex justify-end space-x-2 mt-4">
						<button
							type="button"
							onClick={() => {
								setIsSubMenuOpen(false);
								setSelectedFilter(null);
								setError("");
							}}
							className="btn outline"
						>
							Cancel
						</button>
						<button type="button" onClick={handleClick} className="btn primary">
							Apply
						</button>
					</div>
				</div>
			)}
		</div>
	);

	if (customFiltersRenderer) {
		const containerStyle = customFiltersRenderer.fieldClass || "";

		return (
			<div>
				<FilterBuilder
					searchForm={searchForm}
					containerStyle={containerStyle}
					setFilter={setFilter}
				>
					{customFiltersRenderer.children}
				</FilterBuilder>
			</div>
		);
	}

	return <div>{buttonFilterDisplay}</div>;
}

export default GridMenu;
export { FilterBuilder };
