# Codebase Audit TODO

## 1. Critical Blocking Fixes

- [x] Enforce photographer edit permissions on the backend for profile updates in `src/server/db/controller/photographer.ts`.
- [x] Enforce photographer edit permissions on the backend for contact updates in `src/server/db/controller/photographer-contact.ts`.
- [x] Enforce photographer edit permissions on the backend for offerings updates in `src/server/db/controller/photographer.ts`.
- [x] Return `403` for blocked profile/contact/offerings writes instead of relying on disabled buttons in the UI.
- [x] Decide the temporary behavior for `rejected` and `on_hold` photographers and keep edits locked until a real resubmission flow is implemented.

## 2. Photographer Workflow / Business Logic

- [ ] Replace the current implicit photographer workflow with an explicit state model such as `draft | submitted | approved | rejected | on_hold`.
- [ ] Stop using `pending + onboardingStep + contact` as a proxy for “submitted for review”.
- [ ] Add a real persisted submission marker such as `submittedAt` if a separate workflow enum is not added.
- [ ] Simplify the onboarding step system so UI step numbers and backend step numbers mean the same thing.
- [ ] Remove the current reverse/offset step mapping in `src/components/forms/create-photographer-form.tsx`.
- [ ] Rename or simplify onboarding constants in `src/server/db/controller/photographer.ts` so `AVATAR_COMPLETED_STEP`, `PROFILE_COMPLETED_STEP`, and `FINAL_ONBOARDING_STEP` are unambiguous.
- [ ] Make “draft” a first-class domain state instead of representing drafts as `status: "pending"`.
- [ ] Update `src/lib/photographer-status.ts` to read the new explicit workflow state instead of heuristics.
- [ ] Update onboarding redirects in `src/app/onboarding/page.tsx` to use the new workflow state.
- [ ] Update portfolio page behavior in `src/app/(dashboard)/dashboard/portfolio/page.tsx` to use the new workflow state.
- [ ] Update admin photographer status rendering in `src/app/(dashboard)/admin/photographers/page.tsx` to use the new workflow state.
- [ ] Update admin photographer detail status rendering in `src/app/(dashboard)/admin/photographer/[id]/page.tsx` to use the new workflow state.

## 3. Admin Moderation Rules

- [x] Add explicit allowed moderation transitions in `src/server/db/controller/photographer.ts`.
- [x] Prevent admins from reviewing photographer drafts that were never submitted.
- [x] Prevent invalid transitions such as arbitrarily rejecting or holding entries that are not in a reviewable state.
- [x] Make the admin UI in `src/components/review-workflow/review-decision-actions.tsx` reflect the allowed transition matrix.
- [x] Hide or disable moderation actions on the admin detail page when a state transition is not valid.
- [ ] Add tests for moderation transition rules once the state machine is defined.

## 4. Review Notifications

- [ ] Wire `src/server/email/senders/review.ts` into photographer review actions so users are notified after approval or rejection.
- [ ] Decide whether `on_hold` should also send a notification email and implement it if needed.
- [ ] Trigger notifications only after the moderation transaction commits successfully.
- [ ] Handle notification failures without rolling back a successful moderation write.

## 5. Auth / Verification Consistency

- [ ] Decide the real signup verification policy for the app.
- [ ] If verification is required, enable it in `src/server/auth/index.ts`.
- [ ] If verification is required, send verification on signup instead of leaving the current TODO in `src/components/forms/register/fields.tsx`.
- [ ] If verification is not required, remove the misleading verification copy from `src/components/forms/register/fields.tsx`.
- [ ] Align login/register/account copy with the actual auth configuration.

## 6. Email / Contact Data Integrity

- [ ] Normalize photographer contact emails to lowercase before saving in `src/server/db/controller/photographer-contact.ts`.
- [ ] Normalize photographer contact emails at schema/input boundaries where possible.
- [ ] Update conflict checks in photographer contact save flow to use normalized email values.
- [ ] Make email verification reset logic compare normalized values instead of raw strings.
- [ ] Enforce case-insensitive uniqueness for photographer contact emails at the database layer.
- [ ] Audit existing stored contact emails for case-variant duplicates before adding a stricter DB constraint.

## 7. Performance / Scalability

- [ ] Add a DB-level `getPublished` style query instead of loading all photographers and filtering `isPublished` in memory.
- [ ] Add a dedicated admin list query instead of `getAll()` plus per-row enrichment for every photographer.
- [ ] Remove the current N+1 pattern for admin photographer review entries in `src/server/db/controller/photographer.ts`.
- [ ] Batch or join photographer contact, specialities, and uploads when building admin list rows.
- [ ] Add pagination for the admin photographer listing.
- [ ] Add sorting/filtering in SQL instead of in-memory where practical.

## 8. Server-Side Data Access Architecture

- [ ] Stop calling the app’s own HTTP API from server components when direct controller/service calls are available.
- [ ] Decide on one server-side access pattern: direct domain services or internal HTTP, not both.
- [ ] Refactor `src/lib/server-api.ts` usage out of server-rendered dashboard pages where direct calls are cleaner.
- [ ] Keep HTTP routes as thin adapters for browser/external consumers instead of making them the internal server API layer.
- [ ] Introduce a dedicated service layer if controllers are being used both by routes and by server components.

## 9. Bookmark State / Performance

- [ ] Move bookmark session hydration out of the root layout in `src/app/layout.tsx` or lazy-load it only where bookmark UI exists.
- [ ] Avoid making the whole app dynamic just to support bookmark state.
- [ ] Consider server-provided initial bookmark state for pages that actually render bookmark buttons.
- [ ] Replace the current one-request-per-identifier loading pattern in `src/lib/bookmarks-context.tsx` if bookmark identifiers expand later.
- [ ] Keep bookmark context scoped to pages/components that actually need it.

## 10. Bookmark Data Integrity / Concurrency

- [ ] Make bookmark toggle writes transactional or use upsert semantics to avoid read-then-write races.
- [ ] Gracefully handle unique constraint collisions during bookmark creation.
- [ ] Validate that bookmark targets actually exist before creating bookmarks.
- [ ] Decide what the bookmark API should return for deleted/missing targets and keep it consistent.
- [ ] Add tests for repeated rapid toggles on the same bookmark.

## 11. Uploads / Images Feature Completion

- [ ] Restrict photographer upload kinds so only the owning photographer can upload photographer assets.
- [ ] Add a proper backend write path for photographer portfolio uploads.
- [ ] Persist uploaded portfolio images to `photographer_upload` instead of only returning remote URLs.
- [ ] Add routes/controllers for portfolio image create/delete/list if the feature is meant to ship.
- [ ] Decide whether uploads are part of onboarding completeness or a post-approval feature.
- [ ] If uploads are part of onboarding, include them in readiness checks.
- [ ] If uploads are not ready to ship, remove the dead `/dashboard/images` surface until the feature exists.
- [ ] Audit storage tag/folder naming to remove stale values such as `dezine-mafia`.

## 12. DRY Refactors

- [ ] Create one shared photographer status/view-model helper for admin pages, onboarding, portfolio, and sidebar.
- [ ] Extract the duplicated `buildSpecialitiesStepPayload` helper shared by onboarding and offerings forms.
- [ ] Extract the duplicated `applyValidationErrors` helper shared by onboarding and offerings forms.
- [ ] Extract duplicated photographer display helpers such as `getProfileInitials`.
- [ ] Extract duplicated formatting helpers such as country/experience/status presenters where they are still repeated.
- [ ] Centralize common route auth handling so route files stop rechecking `if (!user) return 401` after `requireAuth`.
- [ ] Add a shared client-side API response helper for `response.json().catch(() => null)` + message extraction.
- [ ] Standardize form submit handling across `item`, `profile`, `contact`, `offerings`, and onboarding forms.

## 13. Dead / Redundant Code Removal

- [ ] Delete unused `getPhotographerPortfolioPageData` from `src/lib/photographer-panel.ts`.
- [ ] Delete the unused cache module in `src/server/cache/index.ts` or wire it into real read paths.
- [ ] Delete unused review workflow utility/components if they are not part of the future admin UI.
- [ ] Delete unused `loadAdminReviewItem` if it is not going to be used.
- [ ] Delete unused `AdminReviewCollectionScreen` if it is not going to be used.
- [ ] Delete unused `ReviewCollectionBrowser` if it is not going to be used.
- [ ] Delete the orphaned `/dashboard/images` page if the image-management feature is not being completed now.
- [ ] Delete unused photographer routes such as POST `/api/photographer` if creation always happens through onboarding draft creation.
- [ ] Delete unused POST `/api/photographer/avatar` if avatar saving is already handled through the onboarding patch route.
- [ ] Delete unused upload kind definitions that are not wired to any real feature.
- [ ] Delete stale schemas/types that are only exported but never consumed.

## 14. Proxy / Middleware Cleanup

- [ ] Delete `src/proxy.ts` if route-level auth checks remain the real protection.
- [ ] If `src/proxy.ts` is kept, fix the matcher so it actually covers nested dashboard routes.
- [ ] Remove misleading comments or temporary auth behavior once the final approach is chosen.

## 15. Naming / Product Cleanup

- [ ] Remove stale “item-first starter app” copy from the product if this repo is now photographer-centric.
- [ ] Remove stale `dezine-mafia` naming from runtime messages and upload metadata.
- [ ] Update `src/config/site.ts` to match the real product direction.
- [ ] Update the public homepage copy to match the real product.
- [ ] Update dashboard/account/admin copy to stop referring to a starter template if that is no longer true.
- [ ] Replace the stock `README.md` with real project documentation.

## 16. Nice-to-Have Structural Refactor

- [ ] Introduce a proper domain/service layer for `photographer`, `bookmark`, `item`, and `account`.
- [ ] Keep DAL focused on persistence only.
- [ ] Keep controllers/services focused on business rules only.
- [ ] Keep API routes focused on auth, validation, and response mapping only.
- [ ] Keep server components focused on rendering and orchestration only.
- [ ] Add tests around photographer workflow transitions, onboarding completeness, and moderation permissions before more UI changes pile on.

## Suggested Execution Order

- [x] Phase 1: lock down backend permissions and moderation transition rules.
- [ ] Phase 2: replace implicit workflow heuristics with explicit photographer state.
- [ ] Phase 3: wire notifications and fix signup/email consistency.
- [ ] Phase 4: clean performance issues in photographer/admin queries.
- [ ] Phase 5: finish or remove the uploads/images feature.
- [ ] Phase 6: attack DRY refactors and dead code removal.
- [ ] Phase 7: do naming/docs cleanup and broader architecture simplification.
