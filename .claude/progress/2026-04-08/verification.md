# Verification Focus: 2026-04-08

## Must Verify

(all passed)

## Should Verify

(all passed)

## Safe to Ignore
- No i18n framework installed — react-i18next is Phase 3 scope
- No persistence — IndexedDB/Dexie.js is Phase 4 scope
- No AI-enhanced mode — Phase 5 scope
- shadcn Button CSS variables lint warning — cosmetic, deferred to Phase 6

## Known Issues
- All enum option values are English (e.g., `question_type: "factual"`) — labels will be i18n'd in Phase 3
- Collapse animation is CSS-only (200ms fade-out + slide-up); no height animation for a fully smooth close
- Add-field ✓ feedback relies on setTimeout — works but not interruptible if user clicks rapidly
