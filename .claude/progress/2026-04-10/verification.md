# Verification Focus: 2026-04-10

## Must Verify

(all passed)

## Should Verify

(all passed)

## Safe to Ignore
- `src/storage/apiKeyVerifier.ts` is unused — cleanup deferred to production readiness
- shadcn Button CSS variables lint warning — cosmetic, not blocking
- Templates store in Dexie schema is created but unused — reserved for future
- Bundle size (611KB JS) triggers Vite warning — acceptable; code-splitting is a future optimization
- Anthropic provider code is complete but hidden from UI due to browser CORS

## Known Issues
- Anthropic API browser requests have unresolved CORS issues — provider temporarily hidden
- Collapse animation is CSS-only (200ms fade-out + slide-up); no height animation
- Add-field checkmark feedback relies on setTimeout — works but not interruptible if user clicks rapidly
- `react-hooks/set-state-in-effect` lint errors (2): App.tsx:83 (tutorial auto-selects task type on first load) and TutorialOverlay.tsx:37 (auto-skips steps with missing DOM targets). Both are intentional reactive-init patterns; refactoring to avoid the rule would add complexity with no behavioral benefit. Revisit if React provides a cleaner primitive.
