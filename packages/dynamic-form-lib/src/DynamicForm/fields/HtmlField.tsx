import DOMPurify from "dompurify";
import type { FieldRuntime, FormValues } from "@/types";

type HtmlFieldType = FieldRuntime & {
	content?: string;
	fieldClass?: string;
};

type Props = {
	field: HtmlFieldType;
	formValues: FormValues;
	disabled?: boolean;
};

const sanitizeHtml = (html: string) => DOMPurify.sanitize(html);

function HtmlField({ field, formValues, disabled }: Props) {
	const isDisabled = !!disabled;

	const raw = formValues[field.name];
	const fromValues = typeof raw === "string" ? raw : "";
	const htmlContent = fromValues || field.content || "";

	const baseClass = `mb-4 ${field.fieldClass ? field.fieldClass : "col-span-full"}`;

	const contentDisplayClasses = `
		w-full px-3 py-2 border rounded-md overflow-y-auto max-h-40 prose prose-sm max-w-none shadow-inner transition duration-150
		${
			isDisabled
				? "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
				: "bg-white text-gray-800 border-gray-200 hover:border-gray-300"
		}
	`.trim();

	const safeHtml = sanitizeHtml(htmlContent);

	return (
		<div key={field.name} className={baseClass} id={`${field.name}_id`}>
			<label htmlFor={field.name} className="block text-sm font-medium mb-1">
				{field.label}
			</label>

			{/* eslint-disable-next-line react/no-danger */}
			<div
				className={contentDisplayClasses}
				dangerouslySetInnerHTML={{ __html: safeHtml }}
			/>
		</div>
	);
}

export default HtmlField;
