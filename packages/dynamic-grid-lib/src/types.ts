import type { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*                               API CLIENT                                   */
/* -------------------------------------------------------------------------- */

export type ApiClientLike = {
	post: (url: string, body?: any) => Promise<any>;
};

/* -------------------------------------------------------------------------- */
/*                                  GRID                                      */
/* -------------------------------------------------------------------------- */

export type SortOrder = "ASC" | "DESC";

export type GridHeader = {
	title: string;
	field: string;
	sortKey?: string;
	display?: boolean;
	isPrimaryKey?: boolean;
};

export type FilterCondition = {
	type: string;
	title: string;
	field: string;
	value: any;
	operator: string;
	source?: Record<string, string>;
	displayValue?: string;
};

export type GridFilters = Record<string, FilterCondition>;

export type GridListResponse<TRecord extends Record<string, any>> = {
	enableCheckbox?: boolean;
	headers: GridHeader[];
	records: TRecord[];
	filters?: Record<string, any>;
	totalCount?: number;
	list?: any;
};

/* -------------------------------------------------------------------------- */
/*                                 GRID PROPS                                 */
/* -------------------------------------------------------------------------- */

export type GridProps<TRecord extends Record<string, any>> = {
	apiUrl: string;
	apiClient: ApiClientLike;
	pageLength?: number;
	refresh?: boolean;
	setRefreshGrid?: (value: boolean) => void;
	onSelectedRows?: (selected: TRecord[]) => void;
	children?: ReactNode;
};

/* -------------------------------------------------------------------------- */
/*                         STATIC SUB COMPONENT TYPES                         */
/* -------------------------------------------------------------------------- */

export type ColumnProps = {
	name: string;
	children?: ReactNode;
};

export type ActionProps = {
	children?: ReactNode;
};

export type SelectedActionsProps = {
	children?: ReactNode;
};

export type FiltersProps = {
	children?: ReactNode;
	fieldClass?: string;
};
