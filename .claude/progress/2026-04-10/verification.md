# Verification Focus: 2026-04-10

## Must Verify

(all passed)

## Should Verify

(all passed)

## Safe to Ignore
- `src/storage/apiKeyVerifier.ts` is unused (mock replaced by real providers) — cleanup in production readiness phase
- shadcn Button CSS variables lint warning — cosmetic, not blocking
- Templates store in Dexie schema is created but unused — reserved for future custom templates
- Bundle size (553KB JS) triggers Vite warning — acceptable for feature-complete app; can optimize later with code splitting
- Anthropic provider code is complete but hidden from UI due to browser CORS

## Known Issues
- Anthropic API browser requests have unresolved CORS issues — provider temporarily hidden from Settings UI
- Collapse animation is CSS-only (200ms fade-out + slide-up); no height animation for fully smooth close
- Add-field checkmark feedback relies on setTimeout — works but not interruptible if user clicks rapidly
- Phase 3's i18n config still reads UI language from localStorage; the Dexie migration only runs once
