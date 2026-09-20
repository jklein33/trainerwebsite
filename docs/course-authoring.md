# Editing course content

Open a course in **Manage → Courses**, then choose **Add lesson**, the pencil icon,
or **Edit lesson & media**. The editor keeps the lesson's title, video, description,
and resources in one place.

- Choose or drop a file into the relevant upload area, then select **Upload file**.
  Completed uploads are selected automatically. Preview the video in the editor;
  resources can be downloaded for inspection. Add resources one at a time.
- **Choose an existing file/video/image** reuses a ready file from the same course.
- **Save changes** saves a draft or archived item. Selecting **Published** changes
  the action to **Save & publish**; a published lesson requires a ready video.
- Uploading a replacement does not immediately change the lesson's saved video.
  Save to apply it. Removing a resource only removes its attachment on save.
- A pending, paused, or failed upload blocks saving until it finishes or is
  discarded. The file upload uses Supabase Storage's resumable upload transport.
- The editor stays open after saving and shows its saved state. Failed saves keep
  the entered content. Closing the editor or following a link with unsaved changes
  asks for confirmation; reloading/closing the browser also requests confirmation.
- While saving, form controls, file drops, and normal link navigation are blocked
  until the request finishes. The file picker uses English labels independently
  of the browser's language; the operating system's picker keeps its own language.
- **Course settings** includes a thumbnail upload and preview. A new course must
  be saved once before its thumbnail can be uploaded.
- The collapsed **Media library** remains available for reuse, upload recovery,
  and permanent file management. Completed uploads remain there if editing is
  cancelled. In-use files cannot be permanently deleted.

## Persistence and access

No database migration or new environment variable is required. Files continue to
use the configured private Supabase bucket. The signed media URL endpoint checks
the current member's access, and administrators can preview ready, unpublished files.

`PUT /api/admin/lessons` checks the administrator session, request origin, selected
module, and each selected asset's course, readiness, and kind before writing.
It saves attachment links and lesson data with a stable editor-generated lesson
UUID and unique attachment links so a retry does not duplicate a new lesson.
New lessons remain drafts until their attachments are saved successfully.

The operation consists of multiple database requests, not one SQL transaction.
If a request fails midway, some attachment changes may already be saved; the UI
reports this and retains the edits for retry. Existing published lessons can
therefore briefly show intermediate resource changes during a save. The video's
reference and description are updated in the final request. Simultaneous editing
of the same lesson uses the existing last-save-wins behavior.

Upload completion is separate from lesson saving. Unattached completed uploads
are retained in the media library for reuse; this feature does not silently
delete files. Word resources are downloads, not an embedded document editor.

## Verification

Local browser checks cover the discard dialog (keep editing, discard, and link
navigation), mobile layout without horizontal overflow, pending uploads blocking
saves, and retaining edits/files after unauthenticated save/upload failures.
These checks used a temporary development fixture, removed afterwards.

The automated lesson persistence tests cover retries after partial writes and
lost responses, attachment reconciliation, and preserving the existing video
when attaching a resource fails. An authenticated staging check is still needed
for upload completion, inline playback, and saving/reopening a real lesson with
its resources. It requires a signed-in administrator in the browser.
