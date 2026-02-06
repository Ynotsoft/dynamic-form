import type {
	ReactNode,
	InputHTMLAttributes,
	TextareaHTMLAttributes,
	SelectHTMLAttributes,
} from "react";

export type FormValues = Record<string, unknown>;

export type ShowIf = (values: FormValues) => boolean;
export type DisabledIf = boolean | ((values: FormValues) => boolean);

export type SelectOption = {
	value: string;
	label: string;
	description?: string;
};

/**
 * Field definition used in formDefinition
 */
export type FieldBase = {
	type: string;
	name?: string;

	label?: string;
	placeholder?: string;

	required?: boolean;

	// dynamic behaviour
	showIf?: ShowIf;
	disabled?: DisabledIf;

	// layout / UI
	fieldClass?: string;
	containerStyle?: "card" | "none" | string;
	containerClassName?: string;
	color?: string;

	// validation
	validate?: (value: unknown, values: FormValues) => string | null;
	fieldType?: string;

	// value / options
	value?: unknown;
	options?: SelectOption[];
	optionsUrl?: string;

	// constraints
	maxLength?: number;
	min?: number;
	max?: number;

	override?: boolean;
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

/**
 * Runtime field passed to field components
 */
export type InputProps = InputHTMLAttributes<HTMLInputElement>;
export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;
export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export type FieldRuntime<TProps = Record<string, unknown>> = FieldBase & {
	name: string;
	props?: TProps;
};

/**
 * Common props for all field components
 */
export type FieldComponentProps<
	TValue = unknown,
	TProps = Record<string, unknown>,
> = {
	field: FieldRuntime<TProps>;
	formValues: FormValues;
	handleChange: (name: string, value: TValue) => void;
	handleBlur: (name: string) => void;
	error?: string;
	disabled?: boolean;
};
