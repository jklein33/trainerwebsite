"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import type { RichNode } from "@/lib/courses/types";
import { safeLink } from "@/lib/courses/validation";
export function DescriptionEditor({
  value,
  onChange,
  disabled = false,
}: {
  value: RichNode;
  onChange: (value: RichNode) => void;
  disabled?: boolean;
}) {
  const [link, setLink] = useState(""),
    [showLink, setShowLink] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [2, 3] },
        link: { openOnClick: false },
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getJSON() as RichNode),
    editorProps: {
      attributes: {
        "aria-label": "Lesson description",
        class: "academy-prose academy-editor-content",
      },
    },
  });
  useEffect(() => {
    editor?.setEditable(!disabled, false);
  }, [editor, disabled]);
  if (!editor) return <div className="academy-muted">Loading editor…</div>;
  const tools: [string, () => void, string][] = [
    ["Bold", () => editor.chain().focus().toggleBold().run(), "bold"],
    ["Italic", () => editor.chain().focus().toggleItalic().run(), "italic"],
    [
      "Underline",
      () => editor.chain().focus().toggleUnderline().run(),
      "underline",
    ],
    [
      "Heading",
      () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      "heading",
    ],
    [
      "Bullets",
      () => editor.chain().focus().toggleBulletList().run(),
      "bulletList",
    ],
    [
      "Numbered",
      () => editor.chain().focus().toggleOrderedList().run(),
      "orderedList",
    ],
  ];
  return (
    <div className="academy-editor">
      <div
        className="academy-editor-tools"
        role="toolbar"
        aria-label="Description formatting"
      >
        {tools.map(([label, action, type]) => (
          <button
            type="button"
            key={label}
            onClick={action}
            aria-pressed={editor.isActive(type)}
          >
            {label}
          </button>
        ))}
        <button type="button" onClick={() => setShowLink(!showLink)}>
          Link
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          Unlink
        </button>
      </div>
      {showLink && (
        <div className="academy-inline">
          <input
            aria-label="Link URL"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://…"
          />
          <button
            type="button"
            disabled={!safeLink(link)}
            onClick={() => {
              editor
                .chain()
                .focus()
                .setLink({ href: safeLink(link)! })
                .run();
              setShowLink(false);
              setLink("");
            }}
          >
            Apply
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
