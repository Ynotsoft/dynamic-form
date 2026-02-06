import React, { Children, useState, isValidElement } from "react";

type FieldConfig = {
	name: string;
	type?: string;
	size?: string;
	fieldClass?: string;
	label?: string;
	operator?: string;
	placeholder?: string;
	includeTime?: boolean;
	dateRange?: boolean;
};

// Filter.Field component - only used for configuration
const Field: React.FC<FieldConfig> = () => null;

type FilterBuilderProps = {
	children?: React.ReactNode;
	searchForm: Record<string, any>;
	containerStyle?: string;
	setFilter: React.Dispatch<React.SetStateAction<any>>;
};

const FilterBuilder: React.FC<FilterBuilderProps> & { Field: typeof Field } = ({
	children,
	searchForm,
	containerStyle,
	setFilter,
}) => {
	const [localFilterValues, setLocalFilterValues] = useState<
		Record<string, any>
	>({});
	const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
		{},
	);

	// Extract <Filter.Field /> config
	const fieldConfigs: FieldConfig[] = [];
	Children.forEach(children, (child) => {
		if (!isValidElement(child)) return;
		if (child.type === Field) {
			fieldConfigs.push(child.props as FieldConfig);
		}
	});

	const handlePanelApplyFilters = () => {
		const newFilters = { ...searchForm };

		Object.entries(localFilterValues).forEach(([header, item]) => {
			const type = searchForm[header]?.type;
			const { value, startDate, endDate, operator, startTime, endTime } =
				item || {};

			newFilters[header] = {
				type,
				title: searchForm[header].title,
				field: searchForm[header].field,
				source: searchForm[header].source,
				operator: operator
					? operator
					: type === "Date"
						? "between"
						: type === "Checkbox"
							? "in"
							: (operator ?? "contains"),
				value:
					type === "Date" && (startDate || endDate)
						? startDate && endDate
							? `${startDate} ${startTime || ""} and ${endDate} ${endTime || ""}`
							: startDate
								? `${startDate} ${startTime || ""} `
								: endDate
									? `${endDate} ${endTime || ""}`
									: ""
						: type === "Checkbox"
							? item
							: value,
				displayValue:
					type === "Date" && startDate && endDate
						? `${startDate} ${startTime || ""} to ${endDate} ${endTime || ""}`
						: type === "Date" && (startDate || endDate)
							? `${startDate} ${startTime || ""} ${endDate} ${endTime || ""}`
							: type === "Checkbox"
								? (item as string[])
										.map((val) => searchForm[header].source?.[val])
										.join(", ")
								: value,
			};
		});

		setFilter(newFilters);
	};

	const fieldsToRender: FieldConfig[] =
		fieldConfigs.length > 0
			? fieldConfigs
			: Object.keys(searchForm || {}).map((key) => ({
					name: key,
					type: searchForm[key]?.type,
				}));

	const renderField = (fieldConfig: FieldConfig) => {
		const {
			name,
			type: configType,
			fieldClass,
			label,
			placeholder,
			includeTime,
			dateRange,
		} = fieldConfig;

		const filterField = searchForm?.[name];
		if (!filterField) return null;

		const fieldType = configType || filterField.type;
		const fieldLabel = label || filterField.title || name;
		const fieldOperator = filterField.operator;

		if (fieldType === "Date") {
			const currentValue = localFilterValues[name] || {};

			return (
				<div
					key={name}
					className={`space-y-2 ${fieldClass || "md:col-span-3"}`}
				>
					<label
						htmlFor={`${fieldLabel}`}
						className="block text-sm font-medium text-gray-700"
					>
						{fieldLabel}
					</label>

					<div className="grid grid-cols-2 gap-2">
						<input
							type="date"
							value={currentValue.startDate || ""}
							onChange={(e) => {
								const updated = {
									type: fieldType,
									startDate: e.target.value,
									endDate: currentValue.endDate || "",
									operator: fieldOperator || "between",
								};
								setLocalFilterValues((prev) => ({ ...prev, [name]: updated }));
							}}
							placeholder={placeholder || "From"}
							className="block w-full border border-gray-300 rounded-md p-2 text-sm"
						/>

						{includeTime && (
							<input
								type="time"
								value={currentValue.startTime || ""}
								onChange={(e) => {
									const updated = {
										type: fieldType,
										startDate: currentValue.startDate || "",
										startTime: e.target.value,
										endDate: currentValue.endDate || "",
										endTime: currentValue.endTime || "",
										operator: currentValue.operator || "between",
									};
									setLocalFilterValues((prev) => ({
										...prev,
										[name]: updated,
									}));
								}}
								placeholder="From Time"
								className="block w-full border border-gray-300 rounded-md p-2 text-sm"
							/>
						)}

						{dateRange !== false && (
							<>
								<input
									type="date"
									value={currentValue.endDate || ""}
									onChange={(e) => {
										const updated = {
											type: fieldType,
											startDate: currentValue.startDate || "",
											endDate: e.target.value,
											operator: currentValue.operator || "between",
										};
										setLocalFilterValues((prev) => ({
											...prev,
											[name]: updated,
										}));
									}}
									placeholder="To"
									className="block w-full border border-gray-300 rounded-md p-2 text-sm"
								/>

								{includeTime && (
									<input
										type="time"
										value={currentValue.endTime || ""}
										onChange={(e) => {
											const updated = {
												type: fieldType,
												startDate: currentValue.startDate || "",
												startTime: currentValue.startTime || "",
												endDate: currentValue.endDate || "",
												endTime: e.target.value,
												operator: currentValue.operator || "between",
											};
											setLocalFilterValues((prev) => ({
												...prev,
												[name]: updated,
											}));
										}}
										placeholder="To Time"
										className="block w-full border border-gray-300 rounded-md p-2 text-sm"
									/>
								)}
							</>
						)}
					</div>
				</div>
			);
		}

		if (fieldType === "Checkbox") {
			const selectedValues: string[] = Array.isArray(localFilterValues[name])
				? localFilterValues[name]
				: [];
			const isOpen = openDropdowns[name] || false;

			const toggleValue = (value: string) => {
				const current: string[] = Array.isArray(localFilterValues[name])
					? localFilterValues[name]
					: [];
				const updated = current.includes(value)
					? current.filter((v) => v !== value)
					: [...current, value];

				setLocalFilterValues((prev) => ({ ...prev, [name]: updated }));
			};

			const removeValue = (value: string, e: React.MouseEvent) => {
				e.stopPropagation();
				const updated = selectedValues.filter((v) => v !== value);
				setLocalFilterValues((prev) => ({ ...prev, [name]: updated }));
			};

			return (
				<div
					key={name}
					className={`space-y-2 ${fieldClass || "md:col-span-3"}`}
				>
					<label
						htmlFor={`${fieldLabel}`}
						className="block text-sm font-medium text-gray-700"
					>
						{fieldLabel}
					</label>

					<div className="relative">
						<button
							type="button"
							onClick={() =>
								setOpenDropdowns((prev) => ({ ...prev, [name]: !isOpen }))
							}
							className="w-full min-h-[42px] bg-white border border-gray-300 rounded-md p-2 text-sm text-left hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
						>
							<div className="flex flex-wrap gap-1.5 items-center">
								{selectedValues.length > 0 ? (
									selectedValues.map((value) => (
										<span
											key={value}
											className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
										>
											{filterField.source?.[value]}
											<button
												type="button"
												onClick={(e) => removeValue(value, e)}
												className="hover:text-blue-900"
											>
												×
											</button>
										</span>
									))
								) : (
									<span className="text-gray-500">
										Select {fieldLabel.toLowerCase()}…
									</span>
								)}

								<svg
									className="ml-auto w-4 h-4 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<title id="svg-title">Select Field...</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</div>
						</button>

						{isOpen && (
							<>
								<button
									type="button"
									className="fixed inset-0 z-10"
									onClick={() =>
										setOpenDropdowns((prev) => ({ ...prev, [name]: false }))
									}
								/>

								<div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
									<div className="p-2">
										{filterField.source &&
											Object.entries(filterField.source).map(([value, lbl]) => {
												const isSelected = selectedValues.includes(value);

												return (
													<label
														key={value}
														className={`flex items-center px-3 py-2 cursor-pointer rounded hover:bg-gray-100 ${
															isSelected ? "bg-blue-50" : ""
														}`}
													>
														<input
															type="checkbox"
															checked={isSelected}
															onChange={() => toggleValue(value)}
															className="w-4 h-4"
														/>
														<span
															className={`ml-2 text-sm ${
																isSelected
																	? "text-blue-700 font-medium"
																	: "text-gray-700"
															}`}
														>
															{String(lbl)}
														</span>
													</label>
												);
											})}
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			);
		}

		return (
			<div key={name} className={`space-y-2 ${fieldClass || "md:col-span-3"}`}>
				<label
					htmlFor={`${fieldLabel}`}
					className="block text-sm font-medium text-gray-700"
				>
					{fieldLabel}
				</label>

				<input
					type="text"
					value={localFilterValues[name]?.value || ""}
					onChange={(e) => {
						const value = e.target.value;
						const updated = { type: fieldType, value, operator: "contains" };
						setLocalFilterValues((prev) => ({ ...prev, [name]: updated }));
					}}
					placeholder={placeholder || `Enter ${fieldLabel.toLowerCase()}…`}
					className="block w-full border border-gray-300 rounded-md p-2 text-sm"
				/>
			</div>
		);
	};

	return (
		<div className={`w-full ${containerStyle || ""}`}>
			<div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-12">
				{fieldsToRender.map(renderField)}
			</div>

			<div className="flex gap-2 pt-3">
				<button
					type="button"
					onClick={handlePanelApplyFilters}
					className="btn bg-primary text-primary-foreground  hover:bg-primary/90 "
				>
					Apply Filters
				</button>
				<button
					type="button"
					onClick={() => {
						setLocalFilterValues({});
						setFilter({});
					}}
					className="btn  text-primary  hover:bg-secondary"
				>
					Clear Filters
				</button>
			</div>
		</div>
	);
};

FilterBuilder.Field = Field;

export default FilterBuilder;
