import React, {
	useState,
	useEffect,
	Children,
	cloneElement,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from "react";
import DOMPurify from "dompurify";
import { RefreshCw } from "lucide-react";

import GridMenu from "./Filter";
import Pagination from "./Pagination";

import type {
	ActionProps,
	ApiClientLike,
	ColumnProps,
	FiltersProps,
	GridFilters,
	GridProps,
	SelectedActionsProps,
	SortOrder,
} from "../types";

declare global {
	interface Window {
		// File System Access API (optional). We fall back to Blob download if missing.
		showSaveFilePicker?: (options?: {
			suggestedName?: string;
			types?: Array<{
				description?: string;
				accept: Record<string, string[]>;
			}>;
		}) => Promise<{
			createWritable: () => Promise<{
				write: (data: string | Blob) => Promise<void>;
				close: () => Promise<void>;
			}>;
		}>;
	}
}

// Column component for custom rendering
const Column: React.FC<ColumnProps> = () => null;

// Action component for custom action rendering
const Action: React.FC<ActionProps> = () => null;

// SelectedActions component for custom selected rows actions
const SelectedActions: React.FC<SelectedActionsProps> = () => null;

// Filters component for custom filters renderer
const Filters: React.FC<FiltersProps> = () => null;

type CustomColumns<TRecord extends Record<string, any>> = Record<
	string,
	ReactNode | ((value: any, record: TRecord) => ReactNode)
>;

type CustomActionRenderer<TRecord extends Record<string, any>> =
	| ReactNode
	| ((record: TRecord) => ReactNode)
	| null;

type CustomSelectedActionsRenderer<TRecord extends Record<string, any>> =
	| ReactNode
	| ((selected: TRecord[], selectedByKey?: any[]) => ReactNode)
	| null;

type CustomFiltersRendererProps = {
	children?: ReactNode;
	fieldClass?: string;
} | null;

function isElementOfType<P>(
	child: unknown,
	component: React.FC<P>,
): child is React.ReactElement<P> {
	return React.isValidElement(child) && child.type === component;
}

type GridComponent = (<TRecord extends Record<string, any>>(
	props: GridProps<TRecord>,
) => ReactElement | null) & {
	Column: typeof Column;
	Action: typeof Action;
	SelectedActions: typeof SelectedActions;
	Filters: typeof Filters;
};

const GridImpl = <TRecord extends Record<string, any>>({
	apiUrl,
	apiClient,
	pageLength = 10,
	refresh,
	setRefreshGrid,
	onSelectedRows = () => {},
	children,
}: GridProps<TRecord>) => {
	const [totalCount, setTotalCount] = useState<number>(0);
	const [pageIndex, setPageIndex] = useState<number>(1);
	const [sortKey, setSortKey] = useState<string>("");
	const [reverse, setReverse] = useState<boolean>(true);

	const [list, setList] = useState<any>([]);
	const [filter, setFilter] = useState<GridFilters>({});
	const [selectedRecords, setSelectedRecords] = useState<TRecord[]>([]);
	const [numberOfRecords, setNumberOfRecords] = useState<number>(pageLength);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [customColumns, setCustomColumns] = useState<CustomColumns<TRecord>>(
		() => ({}),
	);
	const [customActionRenderer, setCustomActionRenderer] = useState<
		CustomActionRenderer<TRecord>
	>(() => null);
	const [customSelectedActionsRenderer, setCustomSelectedActionsRenderer] =
		useState<CustomSelectedActionsRenderer<TRecord>>(() => null);
	const [customFiltersRenderer, setCustomFiltersRenderer] =
		useState<CustomFiltersRendererProps>(() => null);

	const pageSizes = [10, 50, 100, 200, 500];

	if (!apiUrl) throw new Error("apiUrl is required for Grid component.");
	if (!apiClient) throw new Error("apiClient is required for Grid component.");

	useEffect(() => {
		void getList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pageIndex, sortKey, reverse, filter, refresh === true, apiUrl]);

	useEffect(() => {
		onSelectedRows(selectedRecords);
	}, [selectedRecords, onSelectedRows]);

	useEffect(() => {
		const columns: Record<string, any> = {};
		let actionRenderer: any = null;
		let selectedActionsRenderer: any = null;
		let filtersRenderer: any = null;

		if (children) {
			Children.forEach(children, (child) => {
				if (isElementOfType<ColumnProps>(child, Column)) {
					columns[child.props.name] = child.props.children;
					return;
				}

				if (isElementOfType<ActionProps>(child, Action)) {
					actionRenderer = child.props.children;
					return;
				}

				if (isElementOfType<SelectedActionsProps>(child, SelectedActions)) {
					selectedActionsRenderer = child.props.children;
					return;
				}

				if (isElementOfType<FiltersProps>(child, Filters)) {
					filtersRenderer = child.props;
					return;
				}
			});
		}

		setCustomColumns(() => columns);
		setCustomActionRenderer(() => actionRenderer);
		setCustomSelectedActionsRenderer(() => selectedActionsRenderer);
		setCustomFiltersRenderer(() => filtersRenderer);
	}, [children]);

	const getList = async (num: number = numberOfRecords) => {
		try {
			const sort_order: SortOrder = reverse ? "DESC" : "ASC";
			setNumberOfRecords(num);

			const res = await (apiClient as ApiClientLike).post(
				`${apiUrl}?page=${pageIndex}&page_size=${num}&sort_key=${sortKey}&sort_order=${sort_order}`,
				filter,
			);

			const response: any = res?.data ? res.data : res;

			if (response?.enableCheckbox) {
				if (!response.headers?.some((header: any) => header.isPrimaryKey)) {
					console.error(
						"Grid: 'enableCheckbox' is true but no primary key field is defined in headers. Please define a primary key field with 'isPrimaryKey: true'.",
					);
				} else {
					response.records = (response.records || []).map(
						(record: TRecord) => ({
							...record,
							checked: selectedRecords.includes(record),
						}),
					);
				}
			}

			setList(response.list || response);
			setTotalCount(response.totalCount || response?.data?.totalCount || 0);

			if (refresh) {
				setRefreshGrid?.(false);
				setSelectedRecords([]);
			}
		} catch (error) {
			console.error("Error fetching list:", error);
		}
	};

	const htmlMarkup = (dirty: unknown) => {
		const sanitizedHtml = DOMPurify.sanitize(String(dirty ?? ""));
		return { __html: sanitizedHtml };
	};

	const handleSort = (keyname: string) => {
		setSortKey(keyname);
		setReverse(!reverse);
	};

	const handleRemoveFilter = (key: string) => {
		setFilter((prev) => ({
			...prev,
			[key]: {
				...prev[key],
				value: null,
				operator: "",
			},
		}));
	};

	useEffect(() => {
		setPageIndex(1);
	}, [filter, sortKey, reverse]);

	const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
		const checked = e.target.checked;
		const keys: TRecord[] = (list.records || []).map(
			(record: TRecord) => record,
		);

		setSelectedRecords(checked ? keys : []);
		onSelectedRows(checked ? keys : []);
	};

	const handleCheckboxChange = (record: TRecord) => {
		let newSelectedRecords: TRecord[];

		if (selectedRecords.includes(record)) {
			newSelectedRecords = selectedRecords.filter((item) => item !== record);
		} else {
			newSelectedRecords = [...selectedRecords, record];
		}

		setSelectedRecords(newSelectedRecords);
		onSelectedRows(newSelectedRecords);
	};

	const renderCheckbox = (record: TRecord) => {
		if (list.enableCheckbox !== true) return null;

		return (
			<td className="px-2 py-1 text-sm text-gray-600">
				<input
					type="checkbox"
					className="form-checkbox h-5 w-5 text-primary"
					checked={selectedRecords.includes(record)}
					onChange={() => handleCheckboxChange(record)}
				/>
			</td>
		);
	};

	const exportList = async () => {
		try {
			setIsLoading(true);

			const response = await (apiClient as ApiClientLike).post(
				`${apiUrl}?export=csv`,
				filter,
			);
			const csvString =
				typeof response === "string" ? response : response.data || "";

			const fileName = `export_${Date.now()}.csv`;

			// Method A: File System Access API (Chromium)
			if (typeof window !== "undefined" && window.showSaveFilePicker) {
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
					return;
				} catch (err: any) {
					if (err?.name === "AbortError") {
						setIsLoading(false);
						return;
					}
					console.warn("Modern save failed, falling back to legacy method.");
				}
			}

			// Method B: Legacy fallback
			const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");

			link.href = url;
			link.setAttribute("download", fileName);
			document.body.appendChild(link);
			link.click();

			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			setIsLoading(false);
		} catch (error) {
			console.error("Error exporting list:", error);
			setIsLoading(false);
		}
	};

	const renderCell = (record: TRecord, colName: string) => {
		if (customColumns[colName]) {
			const value = (record as any)[colName];
			const renderer = customColumns[colName];

			const rendered =
				typeof renderer === "function"
					? (renderer as (v: any, r: TRecord) => ReactNode)(value, record)
					: isValidElement(renderer)
						? cloneElement(renderer as ReactElement, { value, record } as any)
						: renderer;

			return <>{rendered}</>;
		}

		return (
			<div dangerouslySetInnerHTML={htmlMarkup((record as any)[colName])} />
		);
	};

	const getOtherComponents = () => {
		if (!children) return [];

		return Children.toArray(children).filter((child) => {
			if (!isValidElement(child)) return true;
			return (
				child.type !== Column &&
				child.type !== Action &&
				child.type !== SelectedActions &&
				child.type !== Filters
			);
		});
	};

	return (
		<div className="w-full max-w-full mx-auto">
			<div className="flex justify-between mt-4 h-auto">
				<div className="flex gap-x-2 items-center mb-4 w-full">
					{selectedRecords.length === 0 ? (
						<div className="w-full">
							<GridMenu
								list={list}
								setFilter={setFilter}
								filter={filter}
								customFiltersRenderer={customFiltersRenderer}
							/>

							<div
								className={`flex gap-2 ${customFiltersRenderer ? "justify-end" : ""}`}
							>
								<button
									type="button"
									onClick={() => void exportList()}
									className="btn bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 "
								>
									{isLoading ? (
										<svg
											className="animate-spin h-5 w-5 text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<title id="svg-title">Loading export...</title>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											/>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8v8H4z"
											/>
										</svg>
									) : (
										"Export"
									)}
								</button>

								<button
									type="button"
									className="btn bg-primary"
									onClick={() => void getList()}
								>
									<RefreshCw size={16} />
								</button>
							</div>

							<div className="flex gap-2">{getOtherComponents()}</div>
						</div>
					) : customSelectedActionsRenderer ? (
						typeof customSelectedActionsRenderer === "function" ? (
							(
								customSelectedActionsRenderer as (
									selected: TRecord[],
									selectedByKey?: any[],
								) => ReactNode
							)(
								selectedRecords,
								list.records?.filter((r: any) =>
									selectedRecords.includes(r.primary_key),
								),
							)
						) : isValidElement(customSelectedActionsRenderer) ? (
							cloneElement(
								customSelectedActionsRenderer as ReactElement,
								{
									selectedIds: selectedRecords,
									selectedRecords: list.records?.filter((r: any) =>
										selectedRecords.includes(r.primary_key),
									),
								} as any,
							)
						) : (
							<div>{customSelectedActionsRenderer}</div>
						)
					) : (
						getOtherComponents()
					)}
				</div>
			</div>

			<div className="flex flex-wrap gap-2 mb-4">
				{Object.keys(filter).map((key) => {
					const cond = filter[key];

					if (cond?.value && String(cond.value).length > 0 && cond.operator) {
						return (
							<div
								key={key}
								className="flex items-center space-x-2 order-10 bg-gray-100 px-2 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700"
							>
								<button
									type="button"
									onClick={() => handleRemoveFilter(key)}
									className="pl-1 w-5 h-5 text-gray-400 hover:text-red-600 focus:outline-hidden"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="size-4"
									>
										<title id="svg-title">Removing filter...</title>
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

			<div className="mb-4">
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
											selectedRecords.length === (list.records?.length || 0) &&
											(list.records?.length || 0) > 0
										}
									/>
								</th>
							)}

							{list.headers?.map((header: any, index: number) =>
								header.display === false ? null : (
									<th
										key={`${header}-${index.toString()}`}
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
								<th className="px-2 py-2 text-left text-sm font-semibold text-gray-700 shrink uppercase w-10" />
							)}
						</tr>
					</thead>

					<tbody className="bg-white divide-y text-left divide-gray-200">
						{list.records?.length ? (
							list.records.map((record: TRecord, index: number) => (
								<tr
									key={`${record}-${index.toString()}`}
									className="hover:bg-gray-100"
								>
									{renderCheckbox(record)}

									{list.headers.map((col: any, colIndex: number) =>
										col.display === false ? null : (
											<td
												key={`${col}-${colIndex.toString()}`}
												className="px-2 py-2 text-sm text-gray-600"
											>
												{renderCell(record, col.field)}
											</td>
										),
									)}

									{customActionRenderer && (
										<td className="flex lg:flex-row flex-col px-2 space-y-2 space-x-2 py-2 text-sm text-gray-600  justify-center h-full min-h-16 items-center">
											{typeof customActionRenderer === "function" ? (
												(customActionRenderer as (r: TRecord) => ReactNode)(
													record,
												)
											) : isValidElement(customActionRenderer) ? (
												cloneElement(
													customActionRenderer as ReactElement,
													{ record } as any,
												)
											) : (
												<div>{customActionRenderer}</div>
											)}
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

			<div>
				<div className="flex items-center justify-end mb-4">
					<label htmlFor="pageLength" className="mr-2 text-sm text-gray-600">
						Records per page:
					</label>

					<div className="grid grid-cols-1">
						<select
							id="pageLength"
							className="col-start-1 row-start-1 w-full min-w-20 appearance-none rounded-md bg-white py-[2px] pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 rounded-sm outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800 dark:focus-visible:outline-primary"
							value={numberOfRecords}
							onChange={(e) => {
								setPageIndex(1);
								setSelectedRecords([]);
								void getList(parseInt(e.target.value, 10));
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
							className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
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
			</div>
		</div>
	);
};

const Grid = GridImpl as GridComponent;

Grid.Column = Column;
Grid.Action = Action;
Grid.SelectedActions = SelectedActions;
Grid.Filters = Filters;

export default Grid;
