# Design System

## Purpose

This design system defines the visual and interaction foundation for the SchoolMart MBA frontend. It standardizes tokens, component APIs, and accessibility behavior to keep the product consistent as features grow.

## Design Principles

- Prioritize semantic tokens over one-off color and spacing values.
- Keep component APIs small, predictable, and strongly typed.
- Build accessibility into defaults rather than post-processing.
- Keep chart language consistent across analytics views.

## Current Visual Direction

- Neutral grayscale shell with restrained accents for emphasis states.
- Typography stack: `Outfit` for display/body and `IBM Plex Mono` for data labels.
- Cards, tables, and controls use semantic variables (`--color-surface-*`, `--color-text*`, `--color-border`) rather than route-specific color utilities.

## Token Taxonomy

### Core Brand Tokens

Defined in `frontend/lib/design-tokens.ts` and mirrored in `frontend/app/globals.css`.

- Indigo scale: neutral graphite family used for emphasis and shell hierarchy.
- Teal: positive metrics, successful actions, and recommendation confidence cues.
- Coral: promotional highlights and price-focused CTAs.
- Semantic: success, warning, danger, info.

### Semantic Surface Tokens

Defined in CSS custom properties:

- `--color-bg`
- `--color-surface-1`
- `--color-surface-2`
- `--color-text`
- `--color-text-muted`
- `--color-border`
- `--color-focus`

Use semantic aliases in components. Do not hardcode hex values in TSX unless explicitly approved for charts.

### Scales

- Spacing: 1, 2, 3, 4, 5, 6, 8, 10, 12.
- Radius: sm, md, lg, xl, full.
- Shadow: card, elevated, hover.
- Motion durations: fast, base, slow.
- Motion easing: standard.

## Theming

### Modes

Supported modes:

- Light
- Dark

Theme state is managed by `ThemeContext` with preference persistence in `localStorage` key `schoolmart-theme`.

### Behavior

- Default preference: system.
- Effective theme resolves from system if preference is `system`.
- Dark mode is applied by toggling `.theme-dark` on `<html>`.

## Accessibility Standards

### Required Defaults

- Interactive controls must expose visible `:focus-visible` state.
- Loading UI must use `role="status"` and `aria-live="polite"`.
- Navigation landmarks should use semantic elements and labels.
- Stateful toggles must use `aria-pressed` where appropriate.

### Reduced Motion

Global CSS honors `prefers-reduced-motion: reduce` by minimizing transitions and animations.

## Charts

Shared chart configuration is centralized in `frontend/lib/chart-config.ts`:

- `CHART_GRID`
- `CHART_TICK`
- `CHART_TOOLTIP`
- `CHART_LEGEND`
- `CHART_COLORS`

All Recharts pages should import these constants rather than duplicating inline style objects.

## Component API Conventions

### Shared Type Contracts

Use interfaces and unions from `frontend/lib/types.ts` for shared UI components.

### Naming

- Variant names: descriptive and semantic (for example: `indigo`, `teal`, `rose`).
- Size names: `sm`, `md`, `lg`.
- Metric types: `lift`, `confidence`, `support`, `score`.

## Contribution Rules

### Add New Tokens

1. Add to `frontend/lib/design-tokens.ts`.
2. Map to semantic CSS variables in `frontend/app/globals.css` if used in layout styles.
3. Update this document if the taxonomy changes.

### Add New Shared Components

1. Define a strict prop interface in `frontend/lib/types.ts` if reused across features.
2. Prefer semantic token usage over hardcoded values.
3. Include accessibility attributes by default.

### Review Checklist

- No raw hex colors in TSX except chart constants.
- No duplicated tooltip/legend objects for Recharts.
- Keyboard focus is visible and logical.
- Component variants align with existing naming conventions.
- Light and dark theme behavior verified.
- Use explicit semantic class syntax for CSS variables (for example: `text-[color:var(--color-text)]`, `bg-[color:var(--color-surface-2)]`, `border-[color:var(--color-border)]`).
