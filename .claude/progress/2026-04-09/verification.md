# Verification Focus: 2026-04-09

## Must Verify

(all passed)

## Should Verify

(all passed)

## Safe to Ignore
- No AI-enhanced mode — Phase 5 scope
- shadcn Button CSS variables lint warning — cosmetic, deferred to Phase 6
- Templates store in Dexie schema is created but unused — reserved for future custom templates
- Bundle size increase (~100KB from Dexie) — acceptable for persistence layer

## Known Issues
- Collapse animation is CSS-only (200ms fade-out + slide-up); no height animation for fully smooth close
- Add-field ✓ feedback relies on setTimeout — works but not interruptible if user clicks rapidly
- Phase 3's i18n config still reads UI language from localStorage; the Dexie migration only runs once in App.tsx — if migration fails silently, both systems coexist
- Mock API key verifier shows stale provider name after switching providers (cosmetic only — key storage is correct)
