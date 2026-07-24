# 004 — Navigation Shell and Layout

**Blockers:** 001

## Objective
Build the three-tab navigation shell, theme provider, and layout foundation.

## Acceptance
- [ ] `@react-navigation/native`, `@react-navigation/bottom-tabs` installed
- [ ] Three tabs with placeholder screens: Home, Plans, History
- [ ] Tab icons defined (custom or `@expo/vector-icons`)
- [ ] Theme system in place (`src/utils/theme.ts`):
  - Dark mode: charcoal background, lime-green accent
  - Light mode: off-white background, dark accents
  - System-follow by default (`useColorScheme`)
  - Manual override in settings (stored in local DB/config)
- [ ] Typography, spacing, color tokens defined in theme
- [ ] Placeholder screens show tab name and theme colors
- [ ] SafeAreaView + StatusBar handled

## Notes
- Theme should be accessible from any component via Zustand store or context
- Keep it simple — no animations or transitions in v1
