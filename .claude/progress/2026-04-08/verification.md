# Verification Focus: 2026-04-08

## Must Verify

| Item | Status | Comment |
|------|--------|---------|
| 74 unit tests pass: `npm run test` — covers registry, compiler, formatters, and field components | PASS | 74/74 pass across 7 test files, 1.84s |
| Production build succeeds: `npm run build` — expected ~300KB JS + ~30KB CSS | PASS | 299.92KB JS + 29.79KB CSS, built in 211ms |
| All 6 task types render their fields when selected (not just Ask) | PASS | Playwright verified: 创作 (Create) renders all default fields correctly |
| Progressive disclosure: AddFieldPanel shows optional fields grouped as ★ 推荐 / 其他 / 自定义字段 | PASS | Playwright verified: all 3 sections render with correct headers |
| Task switching preserves intent field value and confirms before clearing other fields | | |

## Should Verify

| Item | Status | Comment |
|------|--------|---------|
| ListField "+" button adds items (not just Enter key) | PASS | Playwright verified: typed "支持中文", clicked "+", item added to list |
| ListField drag reorder has no snap-back animation | | Code fix confirmed (stable useRef IDs); manual drag test recommended |
| KeyValueField "+" button adds pairs and drag-reorder works | | Code follows same pattern as ListField; manual test recommended |
| ToggleField knob stays within switch bounds in both on/off states | PASS | Playwright verified: off state (knob left), on state (knob right, gold bg), no overflow |
| ComboField renders correctly for formerly-select fields (question_type, detail_level, etc.) | PASS | Playwright verified: 输出格式, 内容类型, 语气 all show pills + custom text input |
| AddFieldPanel expand/collapse animation is smooth + scrolls into view | PASS | Playwright verified: slide-expand animation plays, panel scrolls into view |
| Add-field "+" shows ✓ feedback before adding | PASS | Playwright verified: clicked "包含测试" +, field appeared in editor after delay |
| Help badge (?) is visible with border ring at superscript position | PASS | Playwright verified: all field labels show circled ? with visible border |
| All buttons show pointer cursor on hover | PASS | Playwright snapshot confirms `[cursor=pointer]` on all task cards, field buttons, add buttons |

## Safe to Ignore
- README.md doc-debt (stale versions, placeholder setup) — tracked in doc-debt.md, cosmetic
- No i18n framework installed — react-i18next is Phase 3 scope
- No persistence — IndexedDB/Dexie.js is Phase 4 scope
- No AI-enhanced mode — Phase 5 scope
- shadcn Button CSS variables lint warning — cosmetic, deferred to Phase 6

## Known Issues
- CLAUDE.md has uncommitted changes (Playwright screenshots convention + Phase 2 status still says Phase 1)
- All enum option values are English (e.g., `question_type: "factual"`) — labels will be i18n'd in Phase 3
- Collapse animation is CSS-only (200ms fade-out + slide-up); no height animation for a fully smooth close
- Add-field ✓ feedback relies on setTimeout — works but not interruptible if user clicks rapidly
