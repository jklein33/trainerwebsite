import { z } from "zod";
import type { RichNode } from "./types";

export const uuid = z.string().uuid();
export const status = z.enum(["draft", "published", "archived"]);
const title = z.string().trim().min(1).max(160);
export const courseInput = z.object({
  title,
  summary: z.string().max(2000).default(""),
  status: status.default("draft"),
  position: z.number().int().min(0).max(100000).default(0),
  stripe_price_id: z
    .string()
    .regex(/^price_[A-Za-z0-9]+$/)
    .nullable()
    .default(null),
  thumbnail_asset_id: uuid.nullable().default(null),
});
export const moduleInput = z.object({
  title,
  course_id: uuid,
  status: status.default("draft"),
  position: z.number().int().min(0).max(100000).default(0),
});
const allowedTypes = new Set([
  "doc",
  "paragraph",
  "text",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "hardBreak",
  "horizontalRule",
]);
export function safeLink(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return ["https:", "http:", "mailto:"].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function sanitizeDocument(value: unknown): RichNode {
  const serialized = JSON.stringify(value);
  if (!serialized || serialized.length > 80000)
    throw new Error("Description is too long or invalid.");
  let count = 0;
  function visit(input: unknown, depth: number): RichNode {
    if (!input || typeof input !== "object" || depth > 15 || ++count > 3000)
      throw new Error("Invalid description.");
    const node = input as RichNode;
    if (!allowedTypes.has(node.type))
      throw new Error("Unsupported formatting.");
    const result: RichNode = { type: node.type };
    if (node.type === "text")
      result.text = typeof node.text === "string" ? node.text : "";
    if (node.type === "heading")
      result.attrs = {
        level: [2, 3].includes(Number(node.attrs?.level))
          ? Number(node.attrs?.level)
          : 2,
      };
    if (Array.isArray(node.marks))
      result.marks = node.marks.flatMap((mark) => {
        if (
          ["bold", "italic", "underline", "strike", "code"].includes(mark.type)
        )
          return [{ type: mark.type }];
        const href = mark.type === "link" ? safeLink(mark.attrs?.href) : null;
        return href ? [{ type: "link", attrs: { href } }] : [];
      });
    if (Array.isArray(node.content))
      result.content = node.content.map((child) => visit(child, depth + 1));
    return result;
  }
  const doc = visit(value, 0);
  if (doc.type !== "doc") throw new Error("Invalid description.");
  return doc;
}
export const lessonInput = z.object({
  title,
  module_id: uuid,
  description: z.unknown().transform(sanitizeDocument),
  video_asset_id: uuid.nullable().default(null),
  status: status.default("draft"),
  position: z.number().int().min(0).max(100000).default(0),
});
const attachmentMime: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};
export function validateUpload(name: string, kind: string, size: number) {
  const extension = name.split(".").at(-1)?.toLowerCase() ?? "";
  const mime =
    kind === "video"
      ? extension === "mp4"
        ? "video/mp4"
        : extension === "mov"
          ? "video/quicktime"
          : null
      : kind === "image"
        ? (
            {
              jpg: "image/jpeg",
              jpeg: "image/jpeg",
              png: "image/png",
            } as Record<string, string>
          )[extension]
        : attachmentMime[extension];
  const limit = kind === "video" ? 5 * 1024 ** 3 : 25 * 1024 ** 2;
  if (!mime || !Number.isFinite(size) || size <= 0 || size > limit)
    throw new Error(
      kind === "video"
        ? "Choose an MP4 or MOV up to 5 GB."
        : "Choose a supported file up to 25 MB.",
    );
  return { mime, extension };
}
export function safeReturnPath(value: string | null | undefined) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\r\n]/.test(value)
  )
    return "/learn";
  try {
    const parsed = new URL(value, "https://local.invalid");
    return parsed.origin === "https://local.invalid"
      ? parsed.pathname + parsed.search
      : "/learn";
  } catch {
    return "/learn";
  }
}
