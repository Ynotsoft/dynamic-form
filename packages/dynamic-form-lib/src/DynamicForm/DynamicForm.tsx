import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { toast } from "sonner";
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

type FileInputRefs = React.RefObject<Record<string, HTMLInputElement | null>>;

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
	const [formValues, setFormValues] = useState<FormValues>({});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [charCounts, setCharCounts] = useState<Record<string, number>>({});
	const [overrideStatus, setOverrideStatus] = useState<Record<string, boolean>>(
		{},
	);

	const [dynamicOptions, setDynamicOptions] = useState<Record<string, any[]>>(
		{},
	);

	const [fileUploads, setFileUploads] = useState<unknown>(null);

	const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
		isOpen: false,
		fieldName: null,
	});

	const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
	const lastDefaultValues = useRef<string>("");

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
			richtext: RenderHtmlField as unknown as FieldRenderer,
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
				const msg = `apiClient prop is required. Field "${field.name}" failed.`;
				if (debugMode) console.error(msg);
				toast.error("Configuration Error", { description: msg });
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

				setDynamicOptions((prev) => ({
					...prev,
					[field.name!]: options,
				}));
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
		if (!formDefinition?.fields?.length) return;

		const currentDefaultsString = JSON.stringify(defaultValues);
		if (lastDefaultValues.current === currentDefaultsString) return;

		lastDefaultValues.current = currentDefaultsString;

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
	}, [formDefinition, defaultValues]);

	const validateField = useCallback(
		(field: Field, value: unknown, allValues: FormValues): string | null => {
			if (
				field.required &&
				(!value || (Array.isArray(value) && value.length === 0))
			) {
				return `${field.label || field.name} is required`;
			}
			if (field.validate) return field.validate(value, allValues);
			return null;
		},
		[],
	);

	const handleChange = (fieldName: string, value: unknown) => {
		const field = formDefinition.fields.find((f) => f.name === fieldName);
		if (!field) return;

		setFormValues((prev) => {
			const newValues: FormValues = { ...prev };
			newValues[fieldName] = value;

			if (field.type === "multiselect" || field.type === "searchselect") {
				newValues[fieldName] = Array.isArray(value) ? value : [];
			}

			formDefinition.fields.forEach((f) => {
				if (!f.name) return;

				// typeof check for safety
				const isHidden = typeof f.showIf === "function" && !f.showIf(newValues);

				// typeof check for disabled logic
				const isDisabledByLogic =
					typeof f.disabled === "function" && f.disabled(newValues);

				if (isHidden || isDisabledByLogic) {
					const shouldBeArray = ["multiselect", "searchselect"].includes(
						f.type,
					);
					newValues[f.name] = shouldBeArray ? [] : "";
				}
			});

			return newValues;
		});
	};

	const handleBlur = (fieldName: string) => {
		setTouched((prev) => ({ ...prev, [fieldName]: true }));
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const allTouched: Record<string, boolean> = {};
		const newErrors: Record<string, string> = {};

		formDefinition.fields.forEach((field) => {
			if (!field.name) return;

			// Safety check for showIf in submit logic
			const isVisible =
				typeof field.showIf === "function" ? field.showIf(formValues) : true;

			if (isVisible) {
				const err = validateField(field, formValues[field.name], formValues);
				if (err) newErrors[field.name] = err;
			}
		});

		setTouched(allTouched);
		setErrors(newErrors);

		const errorValues = Object.values(newErrors);

		if (errorValues.length !== 0) {
			toast.error(`Please fix ${errorValues.length} form validation errors`);
			return;
		}

		const formattedValues: Record<string, unknown> = {};
		formDefinition.fields.forEach((field) => {
			if (!field.name) return;
			formattedValues[field.name] = formValues[field.name];
		});

		if (debugMode) {
			console.log("Form Submitted Successfully:", formattedValues);
		}

		toast.success("Form submitted successfully!");

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
			if (!isOverridden) {
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
								className="ml-2 p-[0.25rem] rounded-sm transition-all duration-150 text-gray-600 hover:bg-gray-300"
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
				{error && (
					<p id={`${field.name}-error`} className="text-sm text-red-500 mt-1">
						{error}
					</p>
				)}
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
		const isVisible =
			typeof field.showIf === "function" ? field.showIf(formValues) : true;
		if (!isVisible) return null;

		const FieldComponent =
			(FIELD_RENDERERS[field.type] as FieldRenderer | undefined) ??
			(RenderInputField as unknown as FieldRenderer);

		const name = field.name || "";

		const fieldWithDynamicOptions = {
			...field,
			options: dynamicOptions[name] || field.options,
		};

		const error = name ? (errors[name] ?? null) : null;

		// handlelocked/overridden fields
		const isFundamentallyDisabled =
			typeof field.disabled === "function"
				? field.disabled(formValues)
				: !!field.disabled;

		const isOverridden = name ? overrideStatus[name] === true : false;
		const effectiveDisabled = isFundamentallyDisabled && !isOverridden;

		return (
			<div
				className="col-span-full"
				key={name ?? `${field.type}-${field.label}`}
			>
				{fieldFormat(
					<FieldComponent
						field={fieldWithDynamicOptions}
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
					/>,
					field,
					name && touched[name] ? error : null,
				)}
			</div>
		);
	};

	return (
		<div className="w-full">
			{confirmModal.isOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					role="alertdialog"
					aria-modal="true"
					aria-labelledby="modal-title"
				>
					<div
						className="absolute inset-0 bg-black/40"
						onClick={handleCancel}
						aria-hidden="true"
					/>
					<div className="relative z-10 w-full max-w-md rounded-lg bg-background p-4 shadow-xl">
						<h3
							id="modal-title"
							className="text-base font-semibold text-gray-900"
						>
							Enable locked field?
						</h3>
						<p className="mt-1 text-sm text-gray-600">
							This field is locked. Enable override to edit.
						</p>
						<div className="mt-4 flex justify-end gap-2">
							<button
								type="button"
								onClick={handleCancel}
								className="h-9 px-4 text-sm border rounded-md"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleConfirm}
								className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md"
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
				{children && <div className="col-span-full">{children}</div>}
				{footerMode !== "none" && (
					<div
						className={`col-span-full ${footerMode === "sticky" ? "sticky bottom-0 bg-white border-t py-3" : "pt-2"}`}
					>
						<div className="flex justify-end">
							<button
								type="submit"
								className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md"
							>
								Submit
							</button>
						</div>
					</div>
				)}
				{debugMode && (
					<div className="col-span-full mt-4 p-3 bg-gray-100 rounded-md">
						<pre className="text-xs">{JSON.stringify(formValues, null, 2)}</pre>
					</div>
				)}
			</form>
		</div>
	);
};
