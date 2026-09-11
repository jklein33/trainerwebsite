import { test } from "node:test";
import assert from "node:assert/strict";
import {
  safeLink,
  safeReturnPath,
  sanitizeDocument,
  validateUpload,
  courseInput,
} from "../lib/courses/validation";

test("rich text cannot introduce executable links, HTML nodes or oversized trees", () => {
  const doc = sanitizeDocument({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "<script>alert(1)</script>",
            marks: [
              { type: "link", attrs: { href: "javascript:alert(1)" } },
              { type: "bold" },
            ],
          },
        ],
      },
    ],
  });
  assert.deepEqual(doc.content?.[0].content?.[0].marks, [{ type: "bold" }]);
  assert.equal(doc.content?.[0].content?.[0].text, "<script>alert(1)</script>");
  assert.throws(() =>
    sanitizeDocument({ type: "doc", content: [{ type: "iframe" }] }),
  );
  assert.throws(() =>
    sanitizeDocument({
      type: "doc",
      content: [{ type: "text", text: "x".repeat(81000) }],
    }),
  );
  assert.throws(() => sanitizeDocument(undefined));
  let deep: unknown = { type: "paragraph" };
  for (let i = 0; i < 20; i++) deep = { type: "doc", content: [deep] };
  assert.throws(() => sanitizeDocument(deep));
  assert.equal(
    safeLink("https://example.com/notes"),
    "https://example.com/notes",
  );
  assert.equal(safeLink("data:text/html,bad"), null);
});
test("authentication return URLs cannot leave this application", () => {
  for (const target of [
    "//evil.example",
    "https://evil.example",
    "/\\evil.example",
    "/\n/evil.example",
  ])
    assert.equal(safeReturnPath(target), "/learn");
  assert.equal(safeReturnPath("/checkout"), "/checkout");
  assert.equal(
    safeReturnPath("/learn/abc?checkout=cancelled"),
    "/learn/abc?checkout=cancelled",
  );
});
test("upload constraints distinguish video, thumbnail and private resource files", () => {
  assert.equal(
    validateUpload("Lesson.MP4", "video", 10_000_000).mime,
    "video/mp4",
  );
  assert.equal(
    validateUpload("worksheet.docx", "attachment", 1000).mime,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
  assert.throws(() => validateUpload("page.html", "attachment", 1000));
  assert.throws(() => validateUpload("poster.svg", "image", 1000));
  assert.throws(() => validateUpload("recording.mov", "video", 1000));
  assert.throws(() => validateUpload("large.mp4", "video", 6 * 1024 ** 3));
  assert.throws(() => validateUpload("empty.pdf", "attachment", 0));
  assert.throws(() => validateUpload("not-image.pdf", "image", 1000));
});
test("course price mapping only accepts Stripe price identifiers", () => {
  assert.equal(
    courseInput.parse({ title: "Course", stripe_price_id: "price_test123" })
      .stripe_price_id,
    "price_test123",
  );
  assert.throws(() =>
    courseInput.parse({ title: "Course", stripe_price_id: "prod_test123" }),
  );
  assert.throws(() => courseInput.parse({ title: "  " }));
});
