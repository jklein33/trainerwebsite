# Editing course content

Open a course in **Manage → Courses**, then choose **Add lesson**, the pencil icon,
or **Edit lesson & media**. The editor keeps the lesson's title, video, description,
and resources in one place.

- Choose or drop a file into the relevant upload area to start uploading immediately.
  Progress and completion are shown in place; there is no separate upload button.
  Use **Pause upload** / **Resume upload** to pause and continue, or **Retry upload**
  after a failure. Completed uploads are selected automatically. Preview the video in the editor;
  resources can be downloaded for inspection. Add resources one at a time.
- **Choose an existing file/video/image** reuses a ready file from the same course.
- Videos accept MP4 and MOV, up to 5 GB (also subject to the project's Storage limit).
  MOV is stored without conversion, so browser playback is not guaranteed.
  When a MOV is selected, **Choose MP4 replacement** uploads a separately converted
  MP4 and selects it for that lesson. The current saved video is unchanged until
  upload completion and **Save changes** / **Save & publish**. A failed upload or
  closing without saving keeps the existing reference. The original MOV stays in
  the media library, and other lessons using it are not changed. An existing MP4
  from the same course can also be selected. Use H.264 video and AAC audio for
  broad compatibility; renaming the extension does not convert a video.
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
- **Preview** at the top and bottom of the editor opens a learner-style preview
  using the current title, description, selected video, thumbnail, and resources,
  including edits that have not been saved. New, untitled lessons can be previewed.
- **Preview course** and **Preview lesson** in course management open saved content
  directly. Previews include draft modules/lessons, with status labels. Archived
  entries are omitted from the curriculum except a lesson being previewed directly.
- Move between lessons and the course overview inside the preview. **Mobile width**
  narrows the content layout. **Close preview** or Escape returns to the editor
  with its input and scroll position intact. Previewing never saves or publishes.
- Pending uploads are identified in the preview; finish them and reopen it to see
  newly uploaded files. Ready files use the existing authenticated media endpoints.
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

Previews are in-memory dialogs inside the administrator interface, with no public
preview route or token. The existing administrator page checks and asset RLS remain
in effect. Course introductions and lesson bodies share rendering components with
the learner pages; purchase/access checks on those pages are unchanged.

## Verification

Local browser checks cover the discard dialog (keep editing, discard, and link
navigation), mobile layout without horizontal overflow, pending uploads blocking
saves, and retaining edits/files after unauthenticated save/upload failures.
These checks used a temporary development fixture, removed afterwards.
File selection was also checked for automatic video and resource upload startup,
the retry action after a failed request, and restoring save availability after
discarding a failed upload. No separate upload confirmation is required.
Draft preview checks cover course-to-lesson navigation, the next lesson, unsaved
course titles/summaries and lesson titles/notes, an untitled new lesson, closing
and reopening without losing input, Escape/focus restoration, and mobile width.
MOV replacement checks cover the MP4-only replacement picker, automatic startup,
retaining the selected MOV after an unauthenticated upload failure, and restoring
the MP4/MOV picker when the selection is removed. Real MOV playback and a successful
authenticated replacement still require an administrator session and test footage.

The automated lesson persistence tests cover retries after partial writes and
lost responses, attachment reconciliation, and preserving the existing video
when attaching a resource fails. An authenticated staging check is still needed
for upload completion, inline playback, and saving/reopening a real lesson with
its resources. It requires a signed-in administrator in the browser.
