# Verification Focus: 2026-04-09

## Must Verify

(all passed)

## Should Verify

(all passed)

## Safe to Ignore
- `src/storage/apiKeyVerifier.ts` is now unused (mock replaced by real providers) — can be cleaned up in Phase 6
- shadcn Button CSS variables lint warning — cosmetic, deferred to Phase 6
- Templates store in Dexie schema is created but unused — reserved for future custom templates
- Bundle size increase (+4KB from bilingual prompts + model dropdown) — acceptable
- Anthropic provider code is complete but untested in browser — hidden from UI

## Known Issues
- Anthropic API browser request format has unresolved issues — provider temporarily hidden from Settings UI
- Collapse animation is CSS-only (200ms fade-out + slide-up); no height animation for fully smooth close
- Add-field ✓ feedback relies on setTimeout — works but not interruptible if user clicks rapidly
- Phase 3's i18n config still reads UI language from localStorage; the Dexie migration only runs once
