import { useState, useEffect, Children, cloneElement } from "react";
import GridMenu from "./Filter";
import Pagination from "./Pagination";
import DOMPurify from "dompurify";
import { RefreshCw } from "lucide-react";
// Column component for custom rendering
const Column = ({ name, children }) => {
	// This is just a wrapper component that doesn't render anything directly
	return null;
};

// Action component for custom action rendering
const Action = ({ children }) => {
	// This is just a wrapper component that doesn't render anything directly
	return null;
};

// SelectedActions component for custom selected rows actions
const SelectedActions = ({ children }) => {
	// This is just a wrapper component that doesn't render anything directly
	return null;
};

const Filters = ({ children, fieldClass }) => {
	return null;
};

const Grid = ({
	apiUrl,
	apiClient,
	pageLength = 10,
	refresh,
	setRefreshGrid,
	onSelectedRows = () => {},
	children,
}) => {
	const [totalCount, setTotalCount] = useState(0);
	const [pageIndex, setPageIndex] = useState(1);
	const [sortKey, setSortKey] = useState("");
	const [reverse, setReverse] = useState(true);
	const [list, setList] = useState([]);
	const [filter, setFilter] = useState({});
	const [selectedRecords, setSelectedRecords] = useState([]);
	const [numberOfRecords, setNumberOfRecords] = useState(pageLength);
	const [isloading, setIsLoading] = useState(false);
	const [customColumns, setCustomColumns] = useState(() => ({}));
	const [customActionRenderer, setCustomActionRenderer] = useState(() => null);
	const [customSelectedActionsRenderer, setCustomSelectedActionsRenderer] =
		useState(() => null);
	const [customFiltersRenderer, setCustomFiltersRenderer] = useState(
		() => null,
	);

	const pageSizes = [10, 50, 100, 200, 500];

	if (!apiUrl) {
		throw new Error("apiUrl is required for Grid component.");
	}
	if (!apiClient) {
		throw new Error("apiClient is required for Grid component.");
	}

	useEffect(() => {
		getList();
	}, [pageIndex, sortKey, reverse, filter, refresh == true, apiUrl]);

	useEffect(() => {
		onSelectedRows(selectedRecords);
	}, [selectedRecords]);

	useEffect(() => {
		// Extract custom column renderers from children
		const columns = {};
		let actionRenderer = null;
		let selectedActionsRenderer = null;
		let filtersRenderer = null;

		if (children) {
			Children.forEach(children, (child) => {
				if (child?.type === Column) {
					columns[child.props.name] = child.props.children;
				} else if (child?.type === Action) {
					actionRenderer = child.props.children;
				} else if (child?.type === SelectedActions) {
					selectedActionsRenderer = child.props.children;
				} else if (child?.type === Filters) {
					filtersRenderer = child.props;
				}
			});
		}
		// Update state only if there are changes
		setCustomColumns(() => columns);
		setCustomActionRenderer(() => actionRenderer);
		setCustomSelectedActionsRenderer(() => selectedActionsRenderer);
		setCustomFiltersRenderer(() => filtersRenderer);
	}, [children]);

	const getList = async (num = numberOfRecords) => {
		try {
			const sort_order = reverse ? "DESC" : "ASC";
			setNumberOfRecords(num);
			const res = await apiClient.post(
				`${apiUrl}?page=${pageIndex}&page_size=${num}&sort_key=${sortKey}&sort_order=${sort_order}`,
				filter,
			);
			// set all records to checked false
			const response = res?.data ? res.data : res;
			// find if checkbox is enabled and isprimarykey field exists

			if (response?.enableCheckbox) {
				if (!response.headers.some((header) => header.isPrimaryKey)) {
					console.error(
						"Grid: 'enableCheckbox' is true but no primary key field is defined in headers. Please define a primary key field with 'isPrimaryKey: true'.",
					);
				} else {
					response.records = response.records.map((record) => ({
						...record,
						checked: selectedRecords.includes(record),
					}));
				}
			}
			setList(response.list || response);
			setTotalCount(response.totalCount || response?.data?.totalCount || 0);
			if (refresh) {
				setRefreshGrid(false);
				setSelectedRecords([]);
			}
		} catch (error) {
			console.error("Error fetching list:", error);
		}
	};

	const htmlMarkup = (dirty) => {
		const sanitizedHtml = DOMPurify.sanitize(dirty);
		return { __html: sanitizedHtml };
	};

	const handleSort = (keyname) => {
		setSortKey(keyname);
		setReverse(!reverse);
	};

	const handleRemoveFilter = (key) => {
		setFilter((prevFilter) => ({
			...prevFilter,
			[key]: {
				...prevFilter[key],
				value: null,
				operator: "",
			},
		}));
	};

	useEffect(() => {
		setPageIndex(1);
	}, [filter, sortKey, reverse]);

	const renderCheckbox = (record) => {
		if (list.enableCheckbox !== true) return null;
		const primaryKeyValue = record;
		if (!primaryKeyValue) {
			throw new Error("Primary key value not found in record");
		}
		return list.enableCheckbox ? (
			<td className="px-2 py-1 text-sm text-gray-600">
				<input
					type="checkbox"
					className="form-checkbox h-5 w-5 text-primary"
					checked={selectedRecords.includes(record)}
					onChange={() => handleCheckboxChange(primaryKeyValue)}
				/>
			</td>
		) : null;
	};
	const handleSelectAll = (e) => {
		const checked = e.target.checked;
		const keys = list.records.map((record) => record);
		setSelectedRecords(checked ? keys : []);
		onSelectedRows(checked ? keys : []);
	};
	const handleCheckboxChange = (primaryKeyValue) => {
		let newSelectedRecords;
		if (selectedRecords.includes(primaryKeyValue)) {
			newSelectedRecords = selectedRecords.filter(
				(item) => item !== primaryKeyValue,
			);
		} else {
			newSelectedRecords = [...selectedRecords, primaryKeyValue];
		}
		setSelectedRecords(newSelectedRecords);
		onSelectedRows(newSelectedRecords);
	};

	const exportList = async () => {
		try {
			setIsLoading(true);
			const response = await apiClient.post(`${apiUrl}?export=csv`, filter);
			const csvString =
				typeof response === "string" ? response : response.data || "";

			const fileName = `export_${new Date().getTime()}.csv`;

			// Method A: File System Access API
			if ("showSaveFilePicker" in window) {
				try {
					const handle = await window.showSaveFilePicker({
						suggestedName: fileName,
						types: [
							{
								description: "CSV File",
								accept: { "text/csv": [".csv"] },
							},
						],
					});
					const writable = await handle.createWritable();
					await writable.write(csvString);
					await writable.close();
					setIsLoading(false);
					return; // Export complete
				} catch (err) {
					// If user clicked "Cancel", just stop loading and return
					if (err.name === "AbortError") {
						setIsLoading(false);
						return;
					}
					// For any other error, fall through to Method B
					console.warn("Modern Save failed, falling back to legacy method.");
				}
			}

			// Method B: Legacy Fallback (Blob + Anchor Tag)
			const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");

			link.href = url;
			link.setAttribute("download", fileName);
			document.body.appendChild(link);
			link.click();

			// Cleanup
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
			setIsLoading(false);
		} catch (error) {
			console.error("Error exporting list:", error);
			setIsLoading(false);
		}
	};

	// Function to render cell content with custom rendering if available
	const renderCell = (record, colName) => {
		if (customColumns[colName]) {
			// Clone the custom renderer and pass the record value and full record
			const value = record[colName];
			const customRenderer =
				typeof customColumns[colName] === "function"
					? customColumns[colName](value, record)
					: cloneElement(customColumns[colName], { value, record });

			return customRenderer;
		}

		// Default rendering if no custom renderer is provided
		return <div dangerouslySetInnerHTML={htmlMarkup(record[colName])} />;
	};

	// Function to get non-Column children that aren't Action or SelectedActions
	const getOtherComponents = () => {
		if (!children) return [];

		return Children.toArray(children).filter(
			(child) =>
				!child?.type ||
				(child.type !== Column &&
					child.type !== Action &&
					child.type !== SelectedActions),
		);
	};

	return (
		<div className="w-full max-w-full mx-auto  ">
			<div className="flex justify-between mt-4 h-auto ">
				<div className="flex gap-x-2 items-center mb-4 w-full">
					{selectedRecords.length === 0 ? (
						<div className="w-full ">
							<GridMenu
								list={list}
								setFilter={setFilter}
								filter={filter}
								customFiltersRenderer={customFiltersRenderer}
							/>

							<div
								className={`flex gap-2  ${customFiltersRenderer ? "justify-end" : ""}`}
							>
								<button onClick={() => exportList()} className="btn primary">
									{isloading ? (
										<svg
											className="animate-spin h-5 w-5 text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8v8H4z"
											></path>
										</svg>
									) : (
										"Export"
									)}
								</button>

								<button className="btn primary " onClick={() => getList()}>
									<RefreshCw size={16} />
								</button>
							</div>

							<div className="flex gap-2">{getOtherComponents()}</div>
						</div>
					) : customSelectedActionsRenderer ? (
						// Render custom selected actions if provided
						typeof customSelectedActionsRenderer === "function" ? (
							customSelectedActionsRenderer(
								selectedRecords,
								list.records?.filter((r) =>
									selectedRecords.includes(r.primary_key),
								),
							)
						) : (
							cloneElement(customSelectedActionsRenderer, {
								selectedIds: selectedRecords,
								selectedRecords: list.records?.filter((r) =>
									selectedRecords.includes(r.primary_key),
								),
							})
						)
					) : (
						// Render other non-special children
						getOtherComponents()
					)}
				</div>
			</div>
			<div className="flex flex-wrap gap-2 mb-4">
				{Object.keys(filter).map((key) => {
					const cond = filter[key];

					if (cond.value && cond.value.length > 0 && cond.operator) {
						return (
							<div
								key={key}
								className="flex items-center space-x-2 order-10 bg-gray-100 px-2 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700"
							>
								<button
									onClick={() => handleRemoveFilter(key)}
									className="pl-1 w-5 h-5 text-gray-400 hover:text-red-600 focus:outline-hidden"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="size-4"
									>
										<path
											fillRule="evenodd"
											d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
											clipRule="evenodd"
										/>
									</svg>
								</button>
								<span>
									<span className="text-gray-500">
										{cond.title} {cond.operator}:
									</span>
									<span className="text-gray-900"> {cond.displayValue}</span>
								</span>
							</div>
						);
					}
					return null;
				})}
			</div>

			<div className=" mb-4">
				<table className="max-w-full w-full mx-auto bg-white divide-y divide-gray-200">
					<thead className="bg-slate-200">
						<tr>
							{list.enableCheckbox && (
								<th className="px-2 py-2 text-left text-sm font-semibold text-gray-700 shrink uppercase w-10">
									<input
										type="checkbox"
										className="form-checkbox h-5 w-5 text-primary"
										onChange={handleSelectAll}
										checked={
											selectedRecords.length === list.records?.length &&
											list.records.length > 0
										}
									/>
								</th>
							)}

							{/* Use the original header definitions */}
							{list.headers?.map((header, index) =>
								// ignore columns that display is false
								header.display === false ? null : (
									<th
										key={index}
										onClick={() => header.sortKey && handleSort(header.sortKey)}
										className="px-2 py-2 text-left text-sm font-semibold text-gray-700 grow uppercase cursor-pointer hover:bg-gray-200 select-none"
									>
										{header.title}
										{header.sortKey === sortKey && (
											<span className="ml-2 text-gray-500">
												{reverse ? "▼" : "▲"}
											</span>
										)}
									</th>
								),
							)}

							{customActionRenderer && (
								<th className="px-2 py-2 text-left text-sm font-semibold text-gray-700 shrink uppercase w-10"></th>
							)}
						</tr>
					</thead>
					<tbody className="bg-white divide-y text-left divide-gray-200">
						{list.records?.length ? (
							list.records.map((record, index) => (
								<tr key={index} className="hover:bg-gray-100">
									{renderCheckbox(record)}
									{list.headers.map((col, colIndex) =>
										col.display === false ? null : (
											<td
												key={colIndex}
												className="px-2 py-2 text-sm text-gray-600"
											>
												{renderCell(record, col.field)}
											</td>
										),
									)}

									{/* Render custom action column if defined or if showActions is true */}
									{customActionRenderer && (
										<td className="flex lg:flex-row flex-col px-2 space-y-2 space-x-2 py-2 text-sm text-gray-600 items-baseline justify-center h-full min-h-16 items-center">
											{typeof customActionRenderer === "function"
												? customActionRenderer(record)
												: cloneElement(customActionRenderer, { record })}
										</td>
									)}
								</tr>
							))
						) : (
							<tr>
								<td className="px-6 py-4 text-center text-sm text-gray-600">
									No records found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			{
				<>
					<div className="flex items-center justify-end mb-4">
						<label htmlFor="pageLength" className="mr-2 text-sm text-gray-600">
							Records per page:
						</label>
						<div className=" grid grid-cols-1">
							<select
								id="pageLength"
								className="form-select border-gray-300 rounded-md shadow-xs focus:border-primary focus:ring-3 focus:ring-primary focus:ring-opacity-50"
								value={numberOfRecords}
								onChange={(e) => {
									setPageIndex(1);
									setSelectedRecords([]);
									getList(parseInt(e.target.value));
								}}
							>
								{pageSizes.map((size) => (
									<option key={size} value={size} className="text-gray-600">
										{size}
									</option>
								))}
							</select>
							<svg
								viewBox="0 0 16 16"
								fill="currentColor"
								data-slot="icon"
								aria-hidden="true"
								class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
							>
								<path
									d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
									clipRule="evenodd"
									fillRule="evenodd"
								/>
							</svg>
						</div>
					</div>
					<Pagination
						pageIndex={pageIndex}
						pageSize={numberOfRecords}
						totalResults={totalCount}
						setPageIndex={setPageIndex}
					/>
				</>
			}
		</div>
	);
};
// Export Grid and its sub-components
Grid.Column = Column;
Grid.Action = Action;
Grid.SelectedActions = SelectedActions;
Grid.Filters = Filters;

export default Grid;
