# Status: 2026-04-08

## Done

(completed — see conversation log for full list)

## Next

- Begin Phase 3 implementation: JSON/YAML/XML formatters + react-i18next bilingual support
  - Create `src/formatters/json.ts`, `yaml.ts`, `xml.ts` implementing the `Formatter` interface
  - Add `PreviewHeader` component with format pills and output language toggle
  - Set up `react-i18next` with `zh` as default language; migrate hardcoded Chinese strings to i18n keys
  - Install `js-yaml` and `fast-xml-parser` dependencies
  - Add UI language toggle to TopBar, output language toggle to PreviewHeader
  - Update compiler to accept `outputLanguage` parameter

## Notes

- Phase 3 plan is at `docs/superpowers/plans/2026-04-07-intent-compiler-phase3-formats-i18n.md`
