import type { ReactNode } from "react";
import type { RichNode } from "@/lib/courses/types";
import { safeLink } from "@/lib/courses/validation";
export function RichText({ document }: { document: RichNode }) {
  function render(node: RichNode, key: number, depth = 0): ReactNode {
    if (depth > 15) return null;
    const children = node.content?.map((child, i) =>
      render(child, i, depth + 1),
    );
    if (node.type === "text") {
      let text: ReactNode = node.text ?? "";
      for (const mark of node.marks ?? []) {
        if (mark.type === "bold") text = <strong>{text}</strong>;
        if (mark.type === "italic") text = <em>{text}</em>;
        if (mark.type === "underline") text = <u>{text}</u>;
        if (mark.type === "strike") text = <s>{text}</s>;
        if (mark.type === "code") text = <code>{text}</code>;
        if (mark.type === "link") {
          const href = safeLink(mark.attrs?.href);
          if (href)
            text = (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {text}
              </a>
            );
        }
      }
      return <span key={key}>{text}</span>;
    }
    switch (node.type) {
      case "doc":
        return <div key={key}>{children}</div>;
      case "paragraph":
        return <p key={key}>{children}</p>;
      case "heading":
        return node.attrs?.level === 3 ? (
          <h3 key={key}>{children}</h3>
        ) : (
          <h2 key={key}>{children}</h2>
        );
      case "bulletList":
        return <ul key={key}>{children}</ul>;
      case "orderedList":
        return <ol key={key}>{children}</ol>;
      case "listItem":
        return <li key={key}>{children}</li>;
      case "blockquote":
        return <blockquote key={key}>{children}</blockquote>;
      case "hardBreak":
        return <br key={key} />;
      case "horizontalRule":
        return <hr key={key} />;
      default:
        return null;
    }
  }
  return <div className="academy-prose">{render(document, 0)}</div>;
}
