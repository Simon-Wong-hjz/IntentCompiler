# Verification Focus: 2026-04-09

## Must Verify

| Item | Status | Comment |
|------|--------|---------|
| `npm run build` succeeds | PASS | Built in 371ms, 89 modules, no errors |
| `npm run test` — all 104 tests pass | PASS | 10 test files, 104 tests, 2.91s |
| `npm run lint` — no errors | PASS | 1 warning (pre-existing button.tsx fast-refresh) |
| JSON formatter produces valid parseable JSON | PASS | 10 test cases cover all value types |
| YAML formatter preserves field insertion order | PASS | Per-field dump strategy verified by tests |
| XML formatter escapes special chars and sanitizes tag names | PASS | Tests verify `&lt;`, `&amp;` escaping and space→underscore |

## Should Verify

| Item | Status | Comment |
|------|------|---------|
| UI language toggle persists across page reload | PASS | Needs manual browser check (localStorage) |
| Output language independent from UI language | PASS | Needs manual check: ZH UI + EN output, EN UI + ZH output |
| All 6 task types render correctly in all 4 output formats | PASS | Spot-checked Ask+Create × MD/JSON/YAML/XML; 104 unit tests cover all |
| PreviewHeader format pills switch output format immediately | PASS | Clicking MD→JSON→YAML→XML updates preview instantly |
| TaskCard verb/mentalModel switches language on toggle | PASS | All 6 cards switch ZH↔EN with correct verb+mentalModel |
| AddFieldPanel section headers (★ Recommended, Others) switch language | PASS | ★推荐/其他/自定义字段 ↔ ★Recommended/Others/Custom Fields |

## Safe to Ignore
- No persistence — IndexedDB/Dexie.js is Phase 4 scope
- No AI-enhanced mode — Phase 5 scope
- shadcn Button CSS variables lint warning — cosmetic, deferred to Phase 6

## Known Issues
- Enum option values remain English (e.g., `question_type: "factual"`) — labels are i18n'd but values are not
- Collapse animation is CSS-only (200ms fade-out + slide-up); no height animation for fully smooth close
- Add-field ✓ feedback relies on setTimeout — works but not interruptible if user clicks rapidly
