import {
	useCallback,
	useEffect,
	useRef,
	type Dispatch,
	type SetStateAction,
} from "react";

import type {
	FieldComponentProps,
	FieldRuntime,
	FormValues,
	TextareaProps, // Fixed typo from TextAreaProps
} from "@/types";

type TextAreaFieldType = FieldRuntime<TextareaProps> & {
	rows?: number;
	maxLength?: number;
	readOnly?: boolean;
};

type CharCounts = Record<string, number>;

type Props = Omit<FieldComponentProps<string, TextareaProps>, "field"> & {
	field: TextAreaFieldType;
	formValues: FormValues;
	error?: string | null;

	charCount?: number;
	setCharCounts?: Dispatch<SetStateAction<CharCounts>>;
};

function TextAreaField({
	field,
	formValues,
	handleChange,
	handleBlur,
	error,
	charCount,
	setCharCounts,
}: Props) {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	const name = field.name;
	const value = (formValues[name] as string) ?? "";

	const isDisabled =
		typeof field.disabled === "function"
			? field.disabled(formValues)
			: !!field.disabled || !!field.readOnly;

	// Wrapped in useCallback to provide a stable reference for useEffect
	const autoResize = useCallback(() => {
		const el = textareaRef.current;
		if (!el) return;

		el.style.height = "auto";
		el.style.height = `${el.scrollHeight + 2}px`;
	}, []);

	// Effect now correctly depends on autoResize and only runs when necessary
	useEffect(() => {
		autoResize();
	}, [autoResize]);

	const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const next = e.target.value;

		handleChange(name, next);

		// We can call autoResize directly here for immediate UI feedback
		const el = e.target;
		el.style.height = "auto";
		el.style.height = `${el.scrollHeight + 2}px`;

		if (setCharCounts) {
			setCharCounts((prev) => ({
				...prev,
				[name]: next.length,
			}));
		}
	};

	return (
		<div className="space-y-2">
			<textarea
				{...(field.props ?? {})}
				ref={textareaRef}
				id={name}
				name={name}
				placeholder={field.placeholder || ""}
				value={value}
				onChange={handleTextareaChange}
				onBlur={() => handleBlur(name)}
				disabled={isDisabled}
				maxLength={field.maxLength}
				rows={field.rows ?? 3}
				className={`flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-y-auto ${
					error
						? "border-red-500 focus-visible:ring-red-500"
						: "border-input focus-visible:ring-blue-500"
				} ${isDisabled ? "bg-gray-50 text-gray-500" : "bg-background"}`}
				style={{ minHeight: "80px", maxHeight: "400px" }}
			/>

			<div className="flex justify-between items-center">
				{field.maxLength && !field.readOnly ? (
					<span className="text-xs text-gray-500">
						{charCount || 0}/{field.maxLength} characters
					</span>
				) : null}
			</div>
		</div>
	);
}

export default TextAreaField;
