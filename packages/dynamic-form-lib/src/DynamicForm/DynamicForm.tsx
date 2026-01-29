import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
	FormEvent,
	ReactNode,
	Dispatch,
	SetStateAction,
	RefObject,
	ComponentType,
} from "react";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";

import { Lock as LucideLock, LockOpen as LucideLockOpen } from "lucide-react";

import RenderHiddenField from "./fields/HiddenField.jsx";
import RenderMultiSelectField from "./fields/MultiSelectField.jsx";
import SearchSelectField from "./fields/SearchSelectField.jsx";
import RenderSelectField from "./fields/SelectField.jsx";
import RenderEmailField from "./fields/EmailField.jsx";
import RenderInputField from "./fields/InputField.jsx";
import RenderNumberField from "./fields/NumberField.jsx";
import RenderHtmlField from "./fields/HtmlField.jsx";
import RenderCheckboxField from "./fields/CheckboxField.jsx";
import RenderDayPickerField from "./fields/DateRangePickerField.jsx";
import RenderFileInputField from "./fields/FileField.jsx";
import RenderTextAreaField from "./fields/TextArea.jsx";
import DayTimePickerField from "./fields/DayTimePickerField.jsx";
import RenderLineBreakField from "./fields/LineBreakField.jsx";
import RenderRadioGroupField from "./fields/RadioGroups.jsx";
import RenderHeaderField from "./fields/HeaderField.jsx";
import RenderDatePickerField from "./fields/DatePickerField.jsx";
import RenderTimeField from "./fields/timeField.jsx";
import RenderAlertMessageField from "./fields/AlertMessageField.js";

import type { DynamicFormProps, Field, FormValues } from "../types";

type FileInputRefs = RefObject<Record<string, HTMLInputElement | null>>;
type FieldRendererProps = {
	field: Field;
	formValues: FormValues;
	handleChange: (fieldName: string, value: unknown) => void;
	handleBlur: () => void;
	onFieldsChange?: (values: FormValues) => void;
	setCharCounts: Dispatch<SetStateAction<Record<string, number>>>;
	charCount: number;
	api_URL?: string;
	error: string | null;
	fileInputRefs: FileInputRefs;
	fileUploads?: unknown;
	disabled: boolean;
	apiClient?: DynamicFormProps["apiClient"];
};

type FieldRenderer = ComponentType<any>;

type ConfirmModalState = { isOpen: boolean; fieldName: string | null };

const DynamicForm = ({
	formDefinition,
	defaultValues = {},
	apiClient,
	api_URL,
	returnType = false,
	footerMode = "normal",
	debugMode = false,
	onFieldsChange,
	sendFormValues,
	children,
}: DynamicFormProps) => {
	const [formValues, setFormValues] = useState<FormValues>({
		...defaultValues,
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [charCounts, setCharCounts] = useState<Record<string, number>>({});
	const [overrideStatus, setOverrideStatus] = useState<Record<string, boolean>>(
		{},
	);
	const [fileUploads, setFileUploads] = useState<unknown>(null);
	const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
		isOpen: false,
		fieldName: null,
	});

	const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

	const excludeFromFieldFormat = useMemo(
		() => ["hidden", "html", "linebreak", "header", "alert"],
		[],
	);

	const FIELD_COLOR_VARIANTS = useMemo(
		() => ({
			green: "border-green-500 bg-green-50",
			blue: "border-blue-500 bg-blue-50",
			red: "border-red-500 bg-red-50",
			yellow: "border-yellow-500 bg-yellow-50",
			purple: "border-purple-500 bg-purple-50",
			indigo: "border-indigo-500 bg-indigo-50",
			gray: "border-gray-500 bg-gray-50",
			pink: "border-pink-500 bg-pink-50",
			orange: "border-orange-500 bg-orange-50",
		}),
		[],
	);

	const FIELD_RENDERERS = useMemo<Record<string, FieldRenderer>>(
		() => ({
			file: RenderFileInputField,
			multifile: RenderFileInputField,
			dateRange: RenderDayPickerField,
			date: RenderDatePickerField,
			dayTimePicker: DayTimePickerField,
			time: RenderTimeField,
			hidden: RenderHiddenField,
			multiselect: RenderMultiSelectField,
			searchselect: SearchSelectField,
			select: RenderSelectField,
			email: RenderEmailField,
			litertext: RenderHtmlField,
			checkbox: RenderCheckboxField,
			radiogroup: RenderRadioGroupField,
			input: RenderInputField,
			number: RenderNumberField,
			textarea: RenderTextAreaField,
			header: RenderHeaderField,
			alert: RenderAlertMessageField,
			linebreak: RenderLineBreakField,
		}),
		[],
	);

	const loadOptionsForField = useCallback(
		async (field: Field) => {
			if (!apiClient) {
				const msg = `apiClient prop is required when using fields with optionsUrl. Field "${field.name}" requires optionsUrl but no apiClient was provided.`;
				if (debugMode) console.error(msg);
				toast.error(msg);
				return;
			}

			try {
				const response = await apiClient(`/${field.optionsUrl}`);

				type OptionItem = { value: string; label: string };
				const data = (response?.data ?? []) as unknown[];

				let options: OptionItem[] = [];

				if (field.type === "select") {
					options = [
						{
							value: "",
							label: `Select ${String(field.label ?? "").toLowerCase()}`,
						},
						...(data as OptionItem[]),
					];
				} else {
					options = data
						.map((item) => {
							if (
								typeof item === "object" &&
								item !== null &&
								"value" in item &&
								"label" in item
							) {
								const v = (item as Record<string, unknown>).value;
								const l = (item as Record<string, unknown>).label;
								if (typeof v === "string" && typeof l === "string") {
									return { value: v, label: l };
								}
							}
							return null;
						})
						.filter((x): x is OptionItem => x !== null);
				}
				formDefinition.fields.forEach((f) => {
					if (f.name === field.name) f.options = options;
				});
			} catch (err) {
				if (debugMode)
					console.error(`Failed to load options for ${field.name}:`, err);
			}
		},
		[apiClient, debugMode, formDefinition],
	);

	useEffect(() => {
		if (!formDefinition?.fields?.length) return;

		const hasData = formDefinition.fields.some((f) => f.value);
		if (!hasData) return;

		formDefinition.fields.forEach((field) => {
			if (field.optionsUrl) void loadOptionsForField(field);
		});

		const initialValues: FormValues = {};
		formDefinition.fields.forEach((field) => {
			if (!field.name) return;

			const shouldBeArray =
				field.type === "multiselect" ||
				field.type === "searchselect" ||
				(field.type === "checkbox" &&
					field.options &&
					field.options.length > 0);

			initialValues[field.name] =
				defaultValues[field.name] ?? field.value ?? (shouldBeArray ? [] : "");
		});

		setFormValues(initialValues);
	}, [formDefinition, defaultValues, loadOptionsForField]);

	const validateField = (
		field: Field,
		value: unknown,
		allValues: FormValues,
	): string | null => {
		const isPlainObject =
			typeof value === "object" &&
			value !== null &&
			!Array.isArray(value) &&
			!(value instanceof Date);

		const isEmpty =
			value === null ||
			value === undefined ||
			(typeof value === "string" && value.trim() === "") ||
			(Array.isArray(value) && value.length === 0) ||
			(field.type === "checkbox" && value === false) ||
			(isPlainObject &&
				Object.keys(value as Record<string, unknown>).length === 0);

		if (field.required && isEmpty) {
			if (debugMode)
				console.warn(`VALIDATION FAILED (REQUIRED): ${field.name} is empty.`);
			return `${field.label} is required`;
		}

		if (isEmpty && !field.required) return null;

		if (field.validate) {
			const error = field.validate(value, allValues);
			if (error) return error;
		}

		if (field.type === "email" && value) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(String(value)))
				return "Please enter a valid email address";
		}

		if (field.type === "number") {
			const num = typeof value === "number" ? value : Number(value);
			if (field.min !== undefined && num < field.min)
				return `${field.label} must be at least ${field.min}`;
			if (field.max !== undefined && num > field.max)
				return `${field.label} must be no more than ${field.max}`;
		}

		if (field.type === "date" && value) {
			if (!dayjs(value as unknown as string | number | Date).isValid())
				return `${field.label} must be a valid date`;
		}

		if (field.maxLength && value && String(value).length > field.maxLength) {
			return `${field.label} must not exceed ${field.maxLength} characters`;
		}

		return null;
	};

	const handleChange = (fieldName: string, value: unknown) => {
		const field = formDefinition.fields.find((f) => f.name === fieldName);
		if (!field) return;

		const newValues: FormValues = { ...formValues };

		if (field.type === "multiselect" || field.type === "searchselect") {
			if (Array.isArray(value)) {
				newValues[fieldName] = value;
			} else if (
				typeof value === "object" &&
				value !== null &&
				"target" in value
			) {
				const target = (value as { target?: unknown }).target;
				const selectedOptions = (target as { selectedOptions?: unknown })
					?.selectedOptions;

				if (selectedOptions && typeof selectedOptions === "object") {
					newValues[fieldName] = Array.from(
						selectedOptions as ArrayLike<unknown>,
					)
						.map((o) =>
							typeof o === "object" && o !== null && "value" in o
								? String((o as Record<string, unknown>).value)
								: "",
						)
						.filter(Boolean);
				} else {
					newValues[fieldName] = [];
				}
			} else {
				newValues[fieldName] = [];
			}
		} else if (field.type === "dateRange") {
			if (Array.isArray(value) && value.length > 0) {
				const first = value[0] as unknown;
				const from =
					typeof first === "object" && first !== null && "from" in first
						? (first as Record<string, unknown>).from
						: undefined;
				const to =
					typeof first === "object" && first !== null && "to" in first
						? (first as Record<string, unknown>).to
						: undefined;

				newValues[fieldName] = [
					{ startDate: from, endDate: to, key: "selection" },
				];
			} else {
				newValues[fieldName] = [];
			}
		}

		if (field.type === "select") {
			formDefinition.fields.forEach((f) => {
				if (f.showIf && !f.showIf(newValues)) {
					if (!f.name) return;

					const shouldBeArray =
						f.type === "multiselect" ||
						f.type === "searchselect" ||
						(f.type === "checkbox" && f.options && f.options.length > 0);

					newValues[f.name] = shouldBeArray ? [] : "";
				}
			});
		}

		formDefinition.fields.forEach((f) => {
			if (typeof f.disabled === "function" && f.disabled(newValues)) {
				if (!f.name) return;

				const shouldBeArray =
					f.type === "multiselect" ||
					f.type === "searchselect" ||
					(f.type === "checkbox" && f.options && f.options.length > 0);

				newValues[f.name] = shouldBeArray ? [] : "";
			}
		});

		setFormValues(newValues);
	};

	const handleBlur = (fieldName: string) => {
		setTouched((prev) => ({ ...prev, [fieldName]: true }));
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const allTouched: Record<string, boolean> = {};
		formDefinition.fields.forEach((field) => {
			if (field.name) allTouched[field.name] = true;
		});
		setTouched(allTouched);

		const newErrors: Record<string, string> = {};
		formDefinition.fields.forEach((field) => {
			if (!field.name) return;

			if (!field.showIf || field.showIf(formValues)) {
				const error = validateField(field, formValues[field.name], formValues);
				if (error) newErrors[field.name] = error;
			}
		});

		setErrors(newErrors);

		if (Object.keys(newErrors).length !== 0) {
			toast.error("Please correct the errors in the form");
			return;
		}

		const castValue = (val: unknown, type: string | undefined) => {
			if (val === "" || val === null || val === undefined) return null;
			const typeLower = String(type ?? "").toLowerCase();

			if (Array.isArray(val)) {
				if (typeLower === "number" || typeLower === "integer") {
					return val.map((v) => (v === "" ? null : Number(v)));
				}
				return val;
			}

			switch (typeLower) {
				case "number":
				case "integer":
				case "float":
					return Number(val);
				case "boolean":
				case "bool":
					return String(val).toLowerCase() === "true" || val === true;
				case "date":
				case "datetime": {
					const dateObj = dayjs(val as unknown as string | number | Date);
					return dateObj.isValid() ? dateObj.toISOString() : val;
				}
				default:
					return val;
			}
		};

		const formattedValues: Record<string, unknown> = {};
		formDefinition.fields.forEach((field) => {
			if (!field.name) return;

			const rawValue = formValues[field.name];
			const type = field.fieldType || "string";
			const convertedValue = castValue(rawValue, type);

			formattedValues[field.name] = returnType
				? { value: convertedValue, fieldType: type }
				: convertedValue;
		});

		if (debugMode) {
			console.log("Form submitted with values:", formattedValues);
			return;
		}

		if (sendFormValues) sendFormValues(formattedValues);
	};

	useEffect(() => {
		if (onFieldsChange) onFieldsChange(formValues);
	}, [formValues, onFieldsChange]);

	const handleConfirm = () => {
		if (confirmModal.fieldName) {
			setOverrideStatus((prev) => ({
				...prev,
				[confirmModal.fieldName as string]: true,
			}));
		}
		setConfirmModal({ isOpen: false, fieldName: null });
	};

	const handleCancel = () => {
		setConfirmModal({ isOpen: false, fieldName: null });
	};

	const fieldFormat = (
		child: ReactNode,
		field: Field,
		error: string | null,
	) => {
		if (excludeFromFieldFormat.includes(field.type)) {
			return <div className={field.fieldClass || "col-span-full"}>{child}</div>;
		}

		const containerStyle = field.containerStyle;
		const color = field.color || "blue";
		const containerClasses =
			containerStyle === "card"
				? `rounded-lg border text-card-foreground shadow-sm p-4 ${
						field.containerClassName ||
						FIELD_COLOR_VARIANTS[color as keyof typeof FIELD_COLOR_VARIANTS] ||
						FIELD_COLOR_VARIANTS.blue
					}`
				: "";

		const isOverridden = field.name
			? overrideStatus[field.name] === true
			: false;
		const showToggleButton = field.disabled === true && field.override === true;

		const toggleOverride = () => {
			if (!field.name) return;

			const willBeEnabled = !isOverridden;
			if (willBeEnabled) {
				setConfirmModal({ isOpen: true, fieldName: field.name });
			} else {
				setOverrideStatus((prev) => ({
					...prev,
					[field.name as string]: false,
				}));
			}
		};

		const fieldContent = (
			<>
				{field.label && (
					<label
						htmlFor={field.name}
						className="block text-sm font-medium mb-1"
					>
						{field.label}
						{field.required && <span className="text-red-500 ml-1">*</span>}
						{showToggleButton && (
							<button
								type="button"
								onClick={toggleOverride}
								className={`ml-2 p-[0.25rem] rounded-sm transition-all duration-150 ${
									isOverridden
										? " text-gray-600 bg-gray-100"
										: " text-gray-600 hover:bg-gray-300"
								}`}
								title={
									isOverridden
										? "Field is Overridden (Enabled)"
										: "Field is Locked (Disabled)"
								}
							>
								{isOverridden ? (
									<LucideLockOpen size={14} />
								) : (
									<LucideLock size={14} />
								)}
							</button>
						)}
					</label>
				)}

				<div>{child}</div>

				{error && <p className="text-sm text-red-500 mt-1">{error}</p>}
			</>
		);

		return (
			<div className={`mb-4 ${field.fieldClass || "col-span-8"}`}>
				{containerStyle === "card" ? (
					<div className={containerClasses}>{fieldContent}</div>
				) : (
					fieldContent
				)}
			</div>
		);
	};

	const renderField = (field: Field) => {
		if (field.showIf && !field.showIf(formValues)) return null;

		const FieldComponent = FIELD_RENDERERS[field.type] || RenderInputField;

		// Initialise value if missing
		if (field.name && formValues[field.name] === undefined) {
			const shouldBeArray =
				field.type === "multiselect" ||
				field.type === "searchselect" ||
				(field.type === "checkbox" &&
					field.options &&
					field.options.length > 0);

			// NOTE: preserves your current mutation behaviour (not ideal but consistent)
			formValues[field.name] =
				field.value !== undefined ? field.value : shouldBeArray ? [] : "";
		}

		const error = field.name ? (errors[field.name] ?? null) : null;

		const isFundamentallyDisabled =
			typeof field.disabled === "function"
				? field.disabled(formValues)
				: !!field.disabled;

		const isOverridden = field.name
			? overrideStatus[field.name] === true
			: false;
		const effectiveDisabled = isFundamentallyDisabled && !isOverridden;

		return fieldFormat(
			<FieldComponent
				field={field}
				formValues={formValues}
				handleChange={handleChange}
				handleBlur={() => field.name && handleBlur(field.name)}
				setCharCounts={setCharCounts}
				charCount={field.name ? charCounts[field.name] || 0 : 0}
				api_URL={api_URL}
				error={error}
				fileInputRefs={fileInputRefs}
				fileUploads={fileUploads}
				onFieldsChange={onFieldsChange}
				disabled={effectiveDisabled}
				apiClient={apiClient}
			/>,
			field,
			error,
		);
	};

	const fieldToConfirm = formDefinition.fields;
};
