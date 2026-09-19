import { test } from "node:test";
import assert from "node:assert/strict";
import { saveLesson, type LessonChanges } from "../lib/courses/save-lesson";
import type { Lesson } from "../lib/courses/types";

const changes: LessonChanges = {
  title: "New lesson",
  module_id: "module-1",
  description: { type: "doc", content: [] },
  video_asset_id: "video-1",
  status: "published",
  position: 0,
};
function fixture() {
  const lessons = new Map<string, Lesson>();
  const resources = new Set<string>();
  const events: string[] = [];
  const store = {
    ensureDraft: async (id: string, data: LessonChanges) => {
      events.push("ensure");
      if (!lessons.has(id))
        lessons.set(id, { ...data, id, status: "draft", created_at: "now" });
    },
    listResources: async () => [...resources],
    addResources: async (_id: string, ids: string[]) => {
      events.push("attach");
      ids.forEach((id) => resources.add(id));
    },
    removeResources: async (_id: string, ids: string[]) => {
      events.push("detach");
      ids.forEach((id) => resources.delete(id));
    },
    updateLesson: async (id: string, data: LessonChanges) => {
      events.push("update");
      const lesson = { ...lessons.get(id)!, ...data };
      lessons.set(id, lesson);
      return lesson;
    },
  };
  return { lessons, resources, events, store };
}

test("failed resource save keeps a new lesson in draft; retry does not duplicate it", async () => {
  const f = fixture();
  let fail = true;
  const add = f.store.addResources;
  f.store.addResources = async (id, ids) => {
    await add(id, ids);
    if (fail) {
      fail = false;
      throw new Error("Response lost after write");
    }
  };
  await assert.rejects(
    saveLesson("stable-id", changes, ["pdf-1", "pdf-1"], f.store),
  );
  assert.equal(f.lessons.get("stable-id")?.status, "draft");
  assert.equal(f.events.includes("update"), false);
  await saveLesson("stable-id", changes, ["pdf-1"], f.store);
  assert.equal(f.lessons.size, 1);
  assert.deepEqual([...f.resources], ["pdf-1"]);
  assert.equal(f.lessons.get("stable-id")?.status, "published");
});

test("retry after the final response is lost keeps one lesson and one attachment", async () => {
  const f = fixture();
  await saveLesson("stable-id", changes, ["pdf-1"], f.store);
  await saveLesson("stable-id", changes, ["pdf-1"], f.store);
  assert.equal(f.lessons.size, 1);
  assert.deepEqual([...f.resources], ["pdf-1"]);
  assert.equal(f.events.filter((event) => event === "attach").length, 1);
});

test("resource failure does not replace the published video's reference", async () => {
  const f = fixture();
  await saveLesson(
    "existing",
    { ...changes, video_asset_id: "old-video" },
    ["old-resource"],
    f.store,
  );
  f.store.addResources = async () => {
    throw new Error("Offline");
  };
  await assert.rejects(
    saveLesson("existing", changes, ["new-resource"], f.store),
  );
  assert.equal(f.lessons.get("existing")?.video_asset_id, "old-video");
  assert.equal(f.lessons.get("existing")?.status, "published");
  assert.deepEqual([...f.resources], ["old-resource"]);
});

test("saving a resource removal changes only the requested attachment links", async () => {
  const f = fixture();
  f.resources.add("keep");
  f.resources.add("remove");
  await saveLesson("stable-id", changes, ["keep", "new"], f.store);
  assert.deepEqual([...f.resources].sort(), ["keep", "new"]);
  assert.deepEqual(f.events, ["ensure", "attach", "detach", "update"]);
});
