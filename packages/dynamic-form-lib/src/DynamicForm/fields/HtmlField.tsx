import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import DOMPurify from "dompurify";
import { useEffect } from "react";
import {
	Bold,
	Italic,
	Underline as UnderlineIcon,
	List,
	ListOrdered,
	Heading1,
	Heading2,
	Undo,
	Redo,
} from "lucide-react";

import type { FieldRuntime, FormValues } from "@/types";

type HtmlFieldType = FieldRuntime & {
	content?: string;
	fieldClass?: string;
};

type Props = {
	field: HtmlFieldType;
	formValues: FormValues;
	handleChange: (fieldName: string, value: string) => void;
	handleBlur: (fieldName: string) => void;
	disabled?: boolean;
};

const MenuBar = ({ editor }: { editor: any }) => {
	if (!editor) return null;

	const btnClass = (active: boolean) =>
		`
		p-2 rounded-sm transition-colors duration-200
		${
			active
				? "bg-primary text-primary-foreground"
				: "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
		}
	`.trim();

	return (
		<div className="flex flex-wrap gap-1 p-1.5 border-b border-input bg-muted/30 rounded-t-lg">
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleBold().run()}
				className={btnClass(editor.isActive("bold"))}
				title="Bold"
			>
				<Bold size={14} />
			</button>

			<button
				type="button"
				onClick={() => editor.chain().focus().toggleItalic().run()}
				className={btnClass(editor.isActive("italic"))}
				title="Italic"
			>
				<Italic size={14} />
			</button>

			<button
				type="button"
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				className={btnClass(editor.isActive("underline"))}
				title="Underline"
			>
				<UnderlineIcon size={14} />
			</button>

			<div className="w-px h-4 bg-border mx-1 self-center" />

			<button
				type="button"
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
				className={btnClass(editor.isActive("heading", { level: 1 }))}
				title="Heading 1"
			>
				<Heading1 size={14} />
			</button>

			<button
				type="button"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={btnClass(editor.isActive("bulletList"))}
				title="Bullet List"
			>
				<List size={14} />
			</button>

			<button
				type="button"
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={btnClass(editor.isActive("orderedList"))}
				title="Numbered List"
			>
				<ListOrdered size={14} />
			</button>

			<div className="w-px h-4 bg-border mx-1 self-center" />

			<div className="flex gap-1 ml-auto">
				<button
					type="button"
					onClick={() => editor.chain().focus().undo().run()}
					className={btnClass(false)}
					title="Undo"
				>
					<Undo size={14} />
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().redo().run()}
					className={btnClass(false)}
					title="Redo"
				>
					<Redo size={14} />
				</button>
			</div>
		</div>
	);
};

function HtmlField({
	field,
	formValues,
	handleChange,
	handleBlur,
	disabled,
}: Props) {
	const isDisabled = !!disabled;

	const rawValue = formValues[field.name];
	const initialContent =
		typeof rawValue === "string" ? rawValue : field.content || "";

	const editor = useEditor({
		extensions: [StarterKit, Underline],
		content: DOMPurify.sanitize(initialContent),
		editable: !isDisabled,
		onUpdate: ({ editor }) => {
			handleChange(field.name, editor.getHTML());
		},
		onBlur: () => {
			handleBlur(field.name);
		},
		editorProps: {
			attributes: {
				class:
					"prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4 text-foreground",
			},
		},
	});

	useEffect(() => {
		if (editor && formValues[field.name] !== editor.getHTML()) {
			editor.commands.setContent(formValues[field.name] || "");
		}
	}, [formValues[field.name], editor]);

	useEffect(() => {
		if (editor) {
			editor.setEditable(!isDisabled);
		}
	}, [isDisabled, editor]);

	const containerClasses = `
		w-full border rounded-lg transition-all duration-200 overflow-hidden shadow-xs
		${
			isDisabled
				? "bg-muted text-muted-foreground border-input cursor-not-allowed opacity-70"
				: "bg-background border-input hover:border-ring/50 focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring"
		}
	`.trim();

	return (
		<div
			key={field.name}
			className={`mb-4 ${field.fieldClass || "col-span-full"}`}
			id={`${field.name}_id`}
		>
			{field.label && (
				<label
					htmlFor={field.name}
					className="block text-sm font-medium mb-1.5 text-foreground"
				>
					{field.label}
				</label>
			)}

			<div className={containerClasses}>
				{!isDisabled && <MenuBar editor={editor} />}
				<EditorContent editor={editor} />
			</div>
		</div>
	);
}

export default HtmlField;
