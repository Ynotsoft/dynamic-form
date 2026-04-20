import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import CharacterCount from "@tiptap/extension-character-count";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  MessageSquareQuote,
  Code,
  Undo,
  Redo,
} from "lucide-react";

// MenuBar component remains the same...
const MenuBar = ({ editor, error }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!editor) return;
    const handler = () => setTick((t) => t + 1);
    editor.on("transaction", handler);
    return () => editor.off("transaction", handler);
  }, [editor]);

  if (!editor) return null;

  const btnClass = (active) =>
    `p-2 rounded-sm transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-ring/40 focus-visible:outline-none ${active
      ? "bg-primary text-primary-foreground"
      : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
      }`.trim();

  const Separator = () => (
    <div className="w-px h-4 bg-border mx-1 self-center" aria-hidden="true" />
  );

  return (
    <div
      className={`flex flex-wrap gap-1 p-1.5 border-b bg-muted/30 rounded-t-lg transition-colors ${error ? "border-red-500/50" : "border-input"
        }`}
      role="toolbar"
      aria-label="Text formatting options"
    >
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass(editor.isActive("bold"))}
          aria-label="Bold"
          aria-pressed={editor.isActive("bold")}
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass(editor.isActive("italic"))}
          aria-label="Italic"
          aria-pressed={editor.isActive("italic")}
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btnClass(editor.isActive("underline"))}
          aria-label="Underline"
          aria-pressed={editor.isActive("underline")}
        >
          <UnderlineIcon size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={btnClass(editor.isActive("strike"))}
          aria-label="Strikethrough"
          aria-pressed={editor.isActive("strike")}
        >
          <Strikethrough size={14} />
        </button>
      </div>
      <Separator />
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level }).run()
            }
            className={btnClass(editor.isActive("heading", { level }))}
            aria-label={`Heading level ${level}`}
            aria-pressed={editor.isActive("heading", { level })}
          >
            {level === 1 && <Heading1 size={16} />}
            {level === 2 && <Heading2 size={16} />}
            {level === 3 && <Heading3 size={14} />}
          </button>
        ))}
      </div>
      <Separator />
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnClass(editor.isActive("bulletList"))}
          aria-label="Bullet list"
          aria-pressed={editor.isActive("bulletList")}
        >
          <List size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnClass(editor.isActive("orderedList"))}
          aria-label="Numbered list"
          aria-pressed={editor.isActive("orderedList")}
        >
          <ListOrdered size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btnClass(editor.isActive("blockquote"))}
          aria-label="Quote"
          aria-pressed={editor.isActive("blockquote")}
        >
          <MessageSquareQuote size={14} />
        </button>
      </div>
      <Separator />
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={btnClass(editor.isActive("codeBlock"))}
          aria-label="Code block"
          aria-pressed={editor.isActive("codeBlock")}
        >
          <Code size={14} />
        </button>
      </div>
      <div className="flex gap-1 ml-auto">
        <Separator />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className={btnClass(false)}
          aria-label="Undo"
        >
          <Undo size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className={btnClass(false)}
          aria-label="Redo"
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
  error,
  disabled,
}) {
  const isDisabled = !!disabled;
  const rawValue = formValues[field.name];
  const initialContent =
    typeof rawValue === "string" ? rawValue : field.content || "";

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: true,
        blockquote: true,
        strike: true,
      }),
      CharacterCount.configure({
        limit: field.maxLength || null,
      }),
    ],
    content: DOMPurify.sanitize(initialContent),
    editable: !isDisabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Strip tags to check if the user actually typed anything
      const isEditorEmpty = editor.getText().trim().length === 0;

      // If empty, pass an empty string to trigger 'required' validation
      // Otherwise, pass the full HTML string
      handleChange(field.name, isEditorEmpty ? "" : html);
    },
    onBlur: () => {
      handleBlur(field.name);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4 text-foreground",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": field.label || "Rich text editor",
        "aria-readonly": isDisabled ? "true" : "false",
        "aria-invalid": error ? "true" : "false",
        id: field.name,
      },
    },
  });

  // Sync editor content with external form changes
  useEffect(() => {
    if (editor && formValues[field.name] !== editor.getHTML()) {
      editor.commands.setContent(formValues[field.name] || "");
    }
  }, [formValues[field.name], editor]);

  useEffect(() => {
    if (editor) editor.setEditable(!isDisabled);
  }, [isDisabled, editor]);

  return (
    <div
      className={`mb-4 ${field.fieldClass || "col-span-full"}`}
      id={`${field.name}_id`}
    >
      <div
        className={`w-full border rounded-lg overflow-hidden transition-all duration-200 ${error
          ? "border-red-500 focus-within:ring-1 focus-within:ring-red-500"
          : "border-input focus-within:border-ring/40 focus-within:shadow-[0_0_0_1px_rgba(var(--ring),0.1)]"
          } ${isDisabled ? "opacity-70 bg-muted cursor-not-allowed" : "bg-background"}`}
      >
        {!isDisabled && <MenuBar editor={editor} error={error} />}

        <EditorContent editor={editor} />

        <div
          className={`flex justify-end px-4 py-2  text-[10px] uppercase tracking-wider ${error
            ? "bg-red-50/50 border-red-500/50 text-red-500"
            : "bg-muted/20 border-input/50 text-muted-foreground"
            }`}
        >
          {editor && (
            <div aria-live="polite">
              {editor.storage.characterCount.characters()}
              {field.maxLength ? ` / ${field.maxLength}` : ""} characters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HtmlField;
