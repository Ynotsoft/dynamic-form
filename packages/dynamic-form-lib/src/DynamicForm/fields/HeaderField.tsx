import type { FieldBase } from "@/types";

type HeaderSize = "md" | "lg" | "xl" | "2xl" | "3xl";
type HeaderAlign = "left" | "center" | "right";
type HeaderSeparator = "line" | "space" | false;

export type HeaderFieldType = FieldBase & {
	text?: string;
	description?: string;
	size?: HeaderSize;
	separator?: HeaderSeparator;
	align?: HeaderAlign;
	className?: string;
};

type Props = {
	field: HeaderFieldType;
};

function HeaderField({ field }: Props) {
	const text = field.text || field.label || "";
	const description = field.description || "";
	const size = field.size || "2xl";
	const separator = field.separator ?? false;
	const align = field.align || "left";
	const customClass = field.className || "";

	const sizeClasses: Record<HeaderSize, string> = {
		md: "text-lg font-semibold",
		lg: "text-xl font-bold",
		xl: "text-2xl font-extrabold",
		"2xl": "text-3xl font-extrabold",
		"3xl": "text-4xl font-extrabold",
	};

	const alignClasses: Record<HeaderAlign, string> = {
		left: "text-left",
		center: "text-center",
		right: "text-right",
	};

	const separatorClasses: Record<"line" | "space" | "false", string> = {
		line: "border-b border-gray-200 pb-3",
		space: "pb-4",
		false: "",
	};

	const headerClass = `
		${sizeClasses[size] ?? sizeClasses["2xl"]}
		${alignClasses[align] ?? alignClasses.left}
		${customClass}
		text-primary tracking-tight w-full
	`.trim();

	const descriptionClass = `
		mt-1 text-lg text-gray-500 w-full
		${alignClasses[align] ?? alignClasses.left}
	`.trim();

	return (
		<div
			className={`my-6 col-span-full w-full border-b border-gray-300 pb-2 ${
				separatorClasses[String(separator) as "line" | "space" | "false"] ??
				separatorClasses.false
			}`}
		>
			<h2 className={headerClass}>{text}</h2>
			{description ? <p className={descriptionClass}>{description}</p> : null}
		</div>
	);
}

export default HeaderField;
