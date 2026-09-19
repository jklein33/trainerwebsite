import type { Lesson } from "./types";

export type LessonChanges = Pick<
  Lesson,
  | "title"
  | "module_id"
  | "description"
  | "video_asset_id"
  | "status"
  | "position"
>;

// Storage uploads and PostgREST writes are separate operations. Keep retries
// idempotent, preserve a new lesson as a draft until its resources are saved,
// and only report success after every write has completed.
export async function saveLesson(
  id: string,
  changes: LessonChanges,
  resourceIds: string[],
  store: {
    ensureDraft: (id: string, changes: LessonChanges) => Promise<void>;
    listResources: (id: string) => Promise<string[]>;
    addResources: (id: string, ids: string[]) => Promise<void>;
    removeResources: (id: string, ids: string[]) => Promise<void>;
    updateLesson: (id: string, changes: LessonChanges) => Promise<Lesson>;
  },
) {
  await store.ensureDraft(id, changes);
  const desired = [...new Set(resourceIds)];
  const existing = await store.listResources(id);
  const added = desired.filter((asset) => !existing.includes(asset));
  const removed = existing.filter((asset) => !desired.includes(asset));
  if (added.length) await store.addResources(id, added);
  if (removed.length) await store.removeResources(id, removed);
  return store.updateLesson(id, changes);
}
