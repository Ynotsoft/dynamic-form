import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";

import { Lock as LucideLock, LockOpen as LucideLockOpen } from "lucide-react";

import RenderHiddenField from "./fields/HiddenField";
import RenderMultiSelectField from "./fields/MultiSelectField";
import SearchSelectField from "./fields/SearchSelectField";
import RenderSelectField from "./fields/SelectField";
import RenderEmailField from "./fields/EmailField";
import RenderInputField from "./fields/InputField";
import RenderNumberField from "./fields/NumberField";
import RenderHtmlField from "./fields/HtmlField";
import RenderCheckboxField from "./fields/CheckboxField";
import RenderDayPickerField from "./fields/DateRangePickerField";
import RenderFileInputField from "./fields/FileField";
import RenderTextAreaField from "./fields/TextAreaField";
import DayTimePickerField from "./fields/DayTimePickerField";
import RenderLineBreakField from "./fields/LineBreakField";
import RenderRadioGroupField from "./fields/RadioGroupsField";
import RenderHeaderField from "./fields/HeaderField";
import RenderDatePickerField from "./fields/DatePickerField";
import RenderTimeField from "./fields/TimeField";
import RenderAlertMessageField from "./fields/AlertMessageField";

import type { DynamicFormProps, Field, FormValues } from "../types";

type FileInputRefs = React.MutableRefObject<
	Record<string, HTMLInputElement | null>
>;

type ConfirmModalState = {
	isOpen: boolean;
	fieldName: string | null;
};

type FieldRendererProps = {
	field: Field;
	formValues: FormValues;
	handleChange: (fieldName: string, value: unknown) => void;
	handleBlur: (fieldName: string) => void;
	onFieldsChange?: (values: FormValues) => void;
	setCharCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
	charCount: number;
	api_URL?: string;
	error: string | null;
	fileInputRefs: FileInputRefs;
	fileUploads?: unknown;
	disabled: boolean;
	apiClient?: DynamicFormProps["apiClient"];
};

type FieldRenderer = (props: FieldRendererProps) => ReactNode;

export const DynamicForm = ({
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
	const didInit = useRef(false);

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
			file: RenderFileInputField as unknown as FieldRenderer,
			multifile: RenderFileInputField as unknown as FieldRenderer,
			dateRange: RenderDayPickerField as unknown as FieldRenderer,
			date: RenderDatePickerField as unknown as FieldRenderer,
			dayTimePicker: DayTimePickerField as unknown as FieldRenderer,
			time: RenderTimeField as unknown as FieldRenderer,
			hidden: RenderHiddenField as unknown as FieldRenderer,
			multiselect: RenderMultiSelectField as unknown as FieldRenderer,
			searchselect: SearchSelectField as unknown as FieldRenderer,
			select: RenderSelectField as unknown as FieldRenderer,
			email: RenderEmailField as unknown as FieldRenderer,
			litertext: RenderHtmlField as unknown as FieldRenderer,
			checkbox: RenderCheckboxField as unknown as FieldRenderer,
			radiogroup: RenderRadioGroupField as unknown as FieldRenderer,
			input: RenderInputField as unknown as FieldRenderer,
			number: RenderNumberField as unknown as FieldRenderer,
			textarea: RenderTextAreaField as unknown as FieldRenderer,
			header: RenderHeaderField as unknown as FieldRenderer,
			alert: RenderAlertMessageField as unknown as FieldRenderer,
			linebreak: RenderLineBreakField as unknown as FieldRenderer,
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
				const response = await apiClient(`/${String(field.optionsUrl ?? "")}`);

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

				// NOTE: keeps your existing mutation behaviour
				formDefinition.fields.forEach((f) => {
					if (f.name === field.name) f.options = options;
				});
			} catch (err) {
				if (debugMode)
					console.error(
						`Failed to load options for ${String(field.name)}:`,
						err,
					);
			}
		},
		[apiClient, debugMode, formDefinition.fields],
	);

	useEffect(() => {
		if (!formDefinition?.fields?.length) return;

		formDefinition.fields.forEach((field) => {
			if (field.optionsUrl) void loadOptionsForField(field);
		});
	}, [formDefinition, loadOptionsForField]);

	useEffect(() => {
		if (didInit.current) return;
		if (!formDefinition?.fields?.length) return;

		didInit.current = true;

		const initialValues: FormValues = {};

		formDefinition.fields.forEach((field) => {
			if (!field.name) return;

			const shouldBeArray =
				field.type === "multiselect" ||
				field.type === "searchselect" ||
				(field.type === "checkbox" && (field.options?.length ?? 0) > 0);

			initialValues[field.name] =
				defaultValues[field.name] ?? field.value ?? (shouldBeArray ? [] : "");
		});

		setFormValues(initialValues);
	}, [formDefinition]); // intentionally NOT listening to defaultValues

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
				console.warn(
					`VALIDATION FAILED (REQUIRED): ${String(field.name)} is empty.`,
				);
			return `${String(field.label ?? field.name ?? "This field")} is required`;
		}

		if (isEmpty && !field.required) return null;

		if (field.validate) {
			const err = field.validate(value, allValues);
			if (err) return err;
		}

		if (field.type === "email" && value) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(String(value))) {
				return "Please enter a valid email address";
			}
		}

		if (field.type === "number") {
			const num = typeof value === "number" ? value : Number(value);
			if (field.min !== undefined && num < field.min)
				return `${String(field.label ?? field.name)} must be at least ${field.min}`;
			if (field.max !== undefined && num > field.max)
				return `${String(field.label ?? field.name)} must be no more than ${field.max}`;
		}

		if (field.type === "date" && value) {
			if (!dayjs(value as unknown as string | number | Date).isValid())
				return `${String(field.label ?? field.name)} must be a valid date`;
		}

		if (field.maxLength && value && String(value).length > field.maxLength) {
			return `${String(field.label ?? field.name)} must not exceed ${field.maxLength} characters`;
		}

		return null;
	};

	const handleChange = (fieldName: string, value: unknown) => {
		const field = formDefinition.fields.find((f) => f.name === fieldName);
		if (!field) return;

		const newValues: FormValues = { ...formValues };

		// Always set the incoming value
		newValues[fieldName] = value;

		// Normalise multi fields
		if (field.type === "multiselect" || field.type === "searchselect") {
			newValues[fieldName] = Array.isArray(value) ? value : [];
		}

		// Reset hidden fields when a select changes
		if (field.type === "select") {
			formDefinition.fields.forEach((f) => {
				if (f.showIf && !f.showIf(newValues)) {
					if (!f.name) return;

					const shouldBeArray =
						f.type === "multiselect" ||
						f.type === "searchselect" ||
						(f.type === "checkbox" && (f.options?.length ?? 0) > 0);

					newValues[f.name] = shouldBeArray ? [] : "";
				}
			});
		}

		// Reset disabled fields
		formDefinition.fields.forEach((f) => {
			if (typeof f.disabled === "function" && f.disabled(newValues)) {
				if (!f.name) return;

				const shouldBeArray =
					f.type === "multiselect" ||
					f.type === "searchselect" ||
					(f.type === "checkbox" && (f.options?.length ?? 0) > 0);

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
				const err = validateField(field, formValues[field.name], formValues);
				if (err) newErrors[field.name] = err;
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
										? "text-gray-600 bg-gray-100"
										: "text-gray-600 hover:bg-gray-300"
								}`}
								title={
									isOverridden
										? "Field is overridden (enabled)"
										: "Field is locked (disabled)"
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

		const FieldComponent =
			(FIELD_RENDERERS[field.type] as FieldRenderer | undefined) ??
			(RenderInputField as unknown as FieldRenderer);

		const name = field.name;
		const error = name ? (errors[name] ?? null) : null;

		const isFundamentallyDisabled =
			typeof field.disabled === "function"
				? field.disabled(formValues)
				: !!field.disabled;

		const isOverridden = name ? overrideStatus[name] === true : false;
		const effectiveDisabled = isFundamentallyDisabled && !isOverridden;

		const child = (
			<FieldComponent
				field={field}
				formValues={formValues}
				handleChange={handleChange}
				handleBlur={handleBlur}
				setCharCounts={setCharCounts}
				charCount={name ? charCounts[name] || 0 : 0}
				api_URL={api_URL}
				error={name && touched[name] ? error : null}
				fileInputRefs={fileInputRefs}
				fileUploads={fileUploads}
				onFieldsChange={onFieldsChange}
				disabled={effectiveDisabled}
				apiClient={apiClient}
			/>
		);

		return (
			<div
				className="col-span-full"
				key={name ?? `${field.type}-${field.label ?? "field"}`}
			>
				{fieldFormat(child, field, name && touched[name] ? error : null)}
			</div>
		);
	};

	const showFooter = footerMode !== "none";

	return (
		<div className="w-full">
			{confirmModal.isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-black/40"
						onClick={handleCancel}
					/>
					<div className="relative z-10 w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
						<h3 className="text-base font-semibold text-gray-900">
							Enable locked field?
						</h3>
						<p className="mt-1 text-sm text-gray-600">
							This field is locked by default. Enabling override allows it to be
							edited.
						</p>

						<div className="mt-4 flex justify-end gap-2">
							<button
								type="button"
								onClick={handleCancel}
								className="h-9 rounded-md border border-gray-300 bg-white px-4 text-sm hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleConfirm}
								className="h-9 rounded-md bg-blue-600 px-4 text-sm text-white hover:bg-blue-700"
							>
								Enable
							</button>
						</div>
					</div>
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-12 gap-x-4 mx-auto w-full"
			>
				{formDefinition.fields.map((field) => renderField(field))}

				{children ? <div className="col-span-full">{children}</div> : null}

				{showFooter && (
					<div
						className={`col-span-full ${
							footerMode === "sticky"
								? "sticky bottom-0 bg-white border-t border-gray-200 py-3"
								: "pt-2"
						}`}
					>
						<div className="flex items-center justify-end gap-2">
							<button
								type="submit"
								className="h-10 rounded-md bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700"
							>
								Submit
							</button>
						</div>
					</div>
				)}

				{debugMode && (
					<div className="col-span-full mt-4 rounded-md border border-gray-200 bg-gray-50 p-3">
						<pre className="text-xs whitespace-pre-wrap">
							{JSON.stringify(
								{ formValues, errors, touched, overrideStatus },
								null,
								2,
							)}
						</pre>
					</div>
				)}
			</form>
		</div>
	);
};

export default DynamicForm;
