import type { ReactNode } from "react";

export type FormValues = Record<string, unknown>;

export type ShowIf = (values: FormValues) => boolean;
export type DisabledIf = boolean | ((values: FormValues) => boolean);

export type SelectOption = {
	value: string;
	label: string;
	description?: string;
};

export type FieldBase = {
	type: string;
	name?: string;
	label?: string;

	required?: boolean;

	// dynamic behaviours
	showIf?: ShowIf;
	disabled?: DisabledIf;

	// UI + layout
	fieldClass?: string;
	containerStyle?: "card" | "none" | string;
	containerClassName?: string;
	color?: string;

	// override lock feature
	override?: boolean;

	// validation + formatting
	validate?: (value: unknown, values: FormValues) => string | null;
	fieldType?: string; // e.g. "String" | "Date" | "Number" etc.

	// common value/options
	value?: unknown;
	options?: SelectOption[];
	optionsUrl?: string;

	// constraints (used by validateField)
	maxLength?: number;
	min?: number;
	max?: number;
};

export type Field = FieldBase;

export type FormDefinition = {
	fields: Field[];
};

export type ApiClientResponse = { data?: any };

export type ApiClient = (url: string) => Promise<ApiClientResponse>;

export type DynamicFormProps = {
	formDefinition: FormDefinition;
	defaultValues?: FormValues;

	apiClient?: ApiClient;
	api_URL?: string;

	returnType?: boolean;
	footerMode?: "normal" | "sticky" | "none" | string;
	debugMode?: boolean;

	onFieldsChange?: (values: FormValues) => void;
	sendFormValues?: (values: Record<string, unknown>) => void;

	children?: ReactNode;
};
