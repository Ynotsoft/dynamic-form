import React, { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import { cn } from "@/lib/utils.js";

// import "dayjs/locale/de"; // Remove this to avoid module resolution issues
// Removed: import apiClient from "../services/Interceptors.jsx"; - now passed as prop
import { default as RenderHiddenField } from "./fields/HiddenField.jsx";
import { default as RenderMultiSelectField } from "./fields/MultiSelectField.jsx";
import { default as RenderSelectField } from "./fields/SelectField.jsx";
import { default as RenderEmailField } from "./fields/EmailField.jsx";
import { default as RenderInputField } from "./fields/InputField.jsx";
import { default as RenderHtmlField } from "./fields/HtmlField.jsx";
import { default as RenderCheckboxField } from "./fields/CheckboxField.jsx";
import { default as RenderDayPickerField } from "./fields/DateRangePickerField.jsx";
import { default as RenderFileInputField } from "./fields/FileField.jsx";
import { default as RenderTextAreaField } from "./fields/TextArea.jsx";
import { default as DayTimePickerField } from "./fields/DayTimePickerField.jsx";
import { default as RenderLineBreakField } from "./fields/LineBreakField.jsx";
import { default as RenderRadioGroupField } from "./fields/RadioGroups.jsx";
import { default as RenderHeaderField } from "./fields/HeaderField.jsx";
import { default as RenderDatePickerField } from "./fields/DatePickerField.jsx";
import { default as RenderTimeField } from "./fields/timeField.jsx";
import { default as RenderAlertMessageField } from "./fields/AlertMessageField.jsx";
const DynamicForm = ({
	apiClient,
	api_URL,
	footerMode = "normal",
	formDefinition,
	sendFormValues,
	className,
	children,
	defaultValues = {},
	onFieldsChange = () => {},
}) => {
	const [formValues, setFormValues] = useState({ ...defaultValues });
	const [errors, setErrors] = useState({});
	const [touched, setTouched] = useState({});
	const [charCounts, setCharCounts] = useState({});
	const excludeFromFieldFormat = [
		"hidden",
		"html",
		"linebreak",
		"header",
		"alert",
	];
	const FIELD_RENDERERS = useMemo(
		() => ({
			file: RenderFileInputField,
			multifile: RenderFileInputField,
			dateRange: RenderDayPickerField,
			date: RenderDatePickerField,
			dayTimePicker: DayTimePickerField,
			time: RenderTimeField,
			hidden: RenderHiddenField,
			multiselect: RenderMultiSelectField,
			select: RenderSelectField,
			email: RenderEmailField,
			litertext: RenderHtmlField,
			checkbox: RenderCheckboxField,
			radiogroup: RenderRadioGroupField,
			input: RenderInputField,
			textarea: RenderTextAreaField,
			header: RenderHeaderField,
			alert: RenderAlertMessageField,
			linebreak: RenderLineBreakField,
		}),
		[],
	);

	const loadOptionsForField = async (field, dependentValue = null) => {
		// Check if apiClient is provided, if not throw an error
		if (!apiClient) {
			const errorMsg = `apiClient prop is required when using fields with optionsUrl. Field "${field.name}" requires optionsUrl but no apiClient was provided.`;
			console.error(errorMsg);
			toast.error(errorMsg);
			return;
		}

		try {
			const response = await apiClient(`/${field.optionsUrl}`);
			// Add empty option at the beginning if not exists
			let options = [];
			if (field.type === "select") {
				options = [
					{ value: "", label: `Select ${field.label.toLowerCase()}` },
					...response.data,
				];
			} else {
				options = [
					...response.data.map((item) => ({
						value: item.value,
						label: item.label,
					})),
				];
			}
			formDefinition.fields.forEach((f) => {
				if (f.name === field.name) {
					f.options = options;
				}
			});
			//setFieldOptions((prev) => ({ ...prev, [field.name]: options }));
		} catch (error) {
			console.error(`Failed to load options for ${field.name}:`, error);
		} finally {
		}
	};

	useEffect(() => {
		if (formDefinition?.fields && formDefinition.fields.length > 0) {
			// Wait until at least one field has a non-empty value
			const hasData = formDefinition.fields.some((f) => f.value);
			if (!hasData) return; // Don't set empty values early

			// Load async options
			formDefinition.fields.forEach((field) => {
				if (field.optionsUrl) loadOptionsForField(field);
			});

			// Initialise form values
			const initialValues = {};
			formDefinition.fields.forEach((field) => {
				initialValues[field.name] =
					defaultValues[field.name] ??
					field.value ??
					(field.type === "multiselect" ? [] : "");
			});

			setFormValues(initialValues);
		}
	}, [formDefinition]);

	const validateField = (field, value, allValues) => {
		if (field.disabled && field.disabled(allValues)) {
			return null;
		}

		// Detect only plain objects (not Date)
		const isPlainObject =
			typeof value === "object" &&
			value !== null &&
			!Array.isArray(value) &&
			!(value instanceof Date);

		// Actual empty check
		const isEmpty =
			value === null ||
			value === undefined ||
			(typeof value === "string" && value.trim() === "") ||
			(Array.isArray(value) && value.length === 0) ||
			(field.type === "checkbox" && value === false) ||
			(isPlainObject && Object.keys(value).length === 0);

		if (field.required && isEmpty) {
			return `${field.label} is required`;
		}

		// Skip further validation if field is empty and not required
		if (isEmpty && !field.required) {
			return null;
		}

		if (field.validate) {
			const error = field.validate(value, allValues);
			if (error) return error;
		}

		// Email validation addition
		if (field.type === "email" && value) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(value)) return "Please enter a valid email address";
		}

		if (field.type === "number") {
			if (field.min !== undefined && value < field.min) {
				return `${field.label} must be at least ${field.min}`;
			}
			if (field.max !== undefined && value > field.max) {
				return `${field.label} must be no more than ${field.max}`;
			}
		}

		if (field.type === "date" && value) {
			// Ensure the value is a valid date
			if (!dayjs(value).isValid()) {
				return `${field.label} must be a valid date`;
			}
		}

		if (field.maxLength && value && value.length > field.maxLength) {
			return `${field.label} must not exceed ${field.maxLength} characters`;
		}

		return null;
	};

	const handleChange = (fieldName, value) => {
		const field = formDefinition.fields.find((f) => f.name === fieldName);
		if (!field) return;

		const newValues = { ...formValues };
		// Handle multiselect values
		if (field.type === "multiselect") {
			newValues[fieldName] = Array.isArray(value)
				? value
				: Array.from(value.target.selectedOptions).map(
						(option) => option.value,
					);
		}
		// Handle DateRangePicker (dayPicker)
		else if (field.type === "dateRange") {
			newValues[fieldName] = [
				{
					startDate: value[0].from,
					endDate: value[0].to,
					key: "selection",
				},
			];
		}
		// Handle DateTime Picker
		else if (field.type === "dayTimePicker") {
			newValues[fieldName] = value
				? dayjs(value).format("YYYY-MM-DD HH:mm:ss")
				: "";
		} else {
			newValues[fieldName] = value;
		}

		// Clear dependent fields when parent selection changes
		if (field.type === "select") {
			formDefinition.fields.forEach((f) => {
				if (f.showIf && !f.showIf(newValues)) {
					newValues[f.name] = f.type === "multiselect" ? [] : "";
				}
			});
		}

		formDefinition.fields.forEach((f) => {
			if (f.disabled && f.disabled(newValues)) {
				newValues[f.name] = f.type === "multiselect" ? [] : "";
			}
		});

		setFormValues(newValues);

		// Validate all fields
		const newErrors = {};
		formDefinition.fields.forEach((f) => {
			if (!f.showIf || f.showIf(newValues)) {
				const error = validateField(f, newValues[f.name], newValues);
				if (error) newErrors[f.name] = error;
			}
		});

		setErrors(newErrors);
	};

	const handleBlur = (fieldName) => {
		setTouched({ ...touched, [fieldName]: true });
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const allTouched = {};
		formDefinition.fields.forEach((field) => {
			allTouched[field.name] = true;
		});
		setTouched(allTouched);

		const newErrors = {};
		formDefinition.fields.forEach((field) => {
			if (
				(!field.showIf || field.showIf(formValues)) &&
				(!field.disabled || !field.disabled(formValues))
			) {
				const error = validateField(field, formValues[field.name], formValues);
				if (error) newErrors[field.name] = error;
			}
		});

		setErrors(newErrors);

		if (Object.keys(newErrors).length === 0) {
			sendFormValues(formValues);
		} else {
			toast.error("Please correct the errors in the form");
		}
	};

	useEffect(() => {
		onFieldsChange(formValues);
	}, [formValues, onFieldsChange]);

	// Color variants for field card container
	const FIELD_COLOR_VARIANTS = {
		green: "border-green-500 bg-green-50",
		blue: "border-blue-500 bg-blue-50",
		red: "border-red-500 bg-red-50",
		yellow: "border-yellow-500 bg-yellow-50",
		purple: "border-purple-500 bg-purple-50",
		indigo: "border-indigo-500 bg-indigo-50",
		gray: "border-gray-500 bg-gray-50",
		pink: "border-pink-500 bg-pink-50",
		orange: "border-orange-500 bg-orange-50",
	};

	function fieldFormat(children, field, error) {
		if (excludeFromFieldFormat.includes(field.type)) {
			return (
				<div className={field.fieldClass || "col-span-full"}>{children}</div>
			);
		}

		const containerStyle = field.containerStyle;
		const color = field.color || "blue";
		const containerClasses =
			containerStyle === "card"
				? `rounded-lg border text-card-foreground shadow-sm p-4 ${field.containerClassName || FIELD_COLOR_VARIANTS[color] || FIELD_COLOR_VARIANTS.blue}`
				: "";

		const content = (
			<>
				{field.label && (
					<label
						htmlFor={field.name}
						className="block text-sm font-medium mb-1"
					>
						{field.label}
						{field.required && <span className="text-red-500 ml-1">*</span>}
					</label>
				)}

				{/* InputField or any other field goes here */}
				<div>{children}</div>
			</>
		);

		return (
			<div className={`mb-4 ${field.fieldClass || "col-span-8"}`}>
				{containerStyle === "card" ? (
					<div className={containerClasses}>{content}</div>
				) : (
					content
				)}
			</div>
		);
	}

	const renderField = (field) => {
		if (field.showIf && !field.showIf(formValues)) return null;

		const FieldComponent = FIELD_RENDERERS[field.type] || RenderInputField;
		if (formValues[field.name] === undefined) {
			formValues[field.name] =
				field.value !== undefined
					? field.value
					: field.type === "multiselect"
						? []
						: "";
		}

		const error =
			touched[field.name] && errors[field.name] ? errors[field.name] : null;

		return fieldFormat(
			<FieldComponent
				field={field}
				formValues={formValues}
				handleChange={handleChange}
				handleBlur={() => handleBlur(field.name)}
				setCharCounts={setCharCounts}
				charCount={charCounts[field.name] || 0}
				api_URL={api_URL}
				error={error}
			/>,
			field,
		);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className={cn("grid grid-cols-12 gap-x-4 mx-auto w-full  ", className)}
		>
			{formDefinition ? (
				formDefinition.fields.map((field) => (
					<div className="col-span-full" key={field.name}>
						{renderField(field)}
					</div>
				))
			) : (
				<div>Loading...</div>
			)}
			<div
				className={
					footerMode === "sticky"
						? "absolute col-span-full w-full bottom-0  bg-white py-4 flex justify-end gap-2 z-50"
						: "col-span-full mt-4 flex justify-end gap-2"
				}
			>
				{children}
			</div>
		</form>
	);
};

export default DynamicForm;
