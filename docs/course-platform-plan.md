# Course platform implementation

The existing repository owns the public site, course application and admin console.
Build for one operator first; extract a reusable core for another brand only when needed.
Reuse Savage AI's calculator/meal logic in a later milestone, not its authentication or application shell.

## Confirmed decisions

- Email/password authentication with Supabase.
- Register and verify/sign in before purchasing; bind purchases to server-verified user IDs.
- Grant course access automatically after payment is confirmed.
- One-time purchases with lifetime access; subscriptions are out of the initial milestone.
- Supabase private Storage for videos, images and lesson attachments.
- A new, dedicated Supabase test project; do not share Savage AI's backend.
- Courses contain ordered modules, which contain ordered lessons.
- Lesson descriptions support basic rich text. Attachments support Word, PDF, JPEG and PNG.
- Responsive learner/admin UI, optional circular module navigation and installable PWA.
- AI meals, messaging, and a second brand are separate milestones.

## Implementation sequence

1. Database schema/RLS, app-specific authentication, public/learner/admin boundaries.
2. Course/module/lesson CRUD, publish/archive, rich text and ordering.
3. Resumable direct uploads, private media delivery, safe replacement/deletion.
4. Stripe checkout and verified, replayable payment fulfillment; manual grants and audit history.
5. PWA, mobile usability, integration/security tests and deployment instructions.

## Release questions

- CC360 migration: number of members, exports, original payment identifiers and materials.
- Circular layout: reference image and expected maximum module count.
- Credentials/configuration for the new test project, email sender, Vercel/domain and Stripe test setup.
- Archiving/deletion expectations and refund/dispute policy.

Record answers and detailed client materials in ignored `client-notes/`, never credentials.
The initial implementation must fail closed without its backend configuration. Do not silently
serve mocked paid content or pretend an upload/payment succeeded.

## Validation

Use unit tests for authorization and input boundaries, PostgreSQL policy tests, production build,
lint, and browser checks. Real signup/email, Storage and Stripe require a configured test project.
Do not treat a local successful build as verification of these external services.

Implementation and local checks are in place. The external end-to-end acceptance gate remains
open until the dedicated project and Stripe test account are connected. See
[setup and acceptance runbook](course-platform-setup.md).

Local validation on 2026-09-08: production build, TypeScript and ESLint passed;
17 database/input checks and 12 desktop/mobile browser checks passed.
The browser checks include actual service-worker registration and offline fallback,
but use Chromium mobile emulation, not physical iOS/Android devices.
Production dependency audit reported zero known vulnerabilities at this check.
