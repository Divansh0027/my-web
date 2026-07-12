# Accessibility (A11y) Guidelines

## Goal
Achieve WCAG 2.1 AA compliance across the application.

## Testing Procedures
- **Keyboard Navigation:** Tab through the entire app without a mouse. Ensure all interactive elements are focusable and usable.
- **Screen Readers:** Test using NVDA (Windows) or VoiceOver (macOS).
- **Automated Testing:** Use `@axe-core/react` in development and `jest-axe` (or `vitest-axe`) in component tests.
- **Lighthouse:** Run Lighthouse Accessibility audits targeting a score ≥ 95.

## Implemented Features
- Focus traps inside modals using `react-focus-lock` (with `returnFocus=true`)
- Skip to main content link for keyboard users
- WAI-ARIA attributes applied appropriately:
  - `aria-label` added to icon-only buttons, social links, and major landmarks (`<main>`, `<nav>`, `<aside>`)
  - `aria-expanded`, `aria-haspopup`, `aria-controls`, `role="menu"`, and `role="menuitem"` added to dropdowns (e.g., Navbar user menu)
  - `aria-pressed` added to toggle buttons (amenities in property listing, favorite buttons, theme switcher, admin toggles)
  - `aria-current="page"` natively supported via `react-router-dom` `NavLink`
  - `aria-describedby`, `aria-errormessage`, `aria-invalid` added to the complex form inside `LoginModal.tsx`
  - `role="alert"` and `aria-live="polite"` applied to error notifications and inline form errors
- Motion reduction based on user preference (`prefers-reduced-motion`) globally using Framer Motion's `MotionConfig`
- Fixed color contrast issues (updated `on-surface-variant` color from `#64748b` to `#475569` to ensure contrast ratio >= 4.5:1 against light backgrounds)
- High contrast and forced-colors support checked

## Known Issues
None at present. We are actively reviewing PRs to ensure accessibility is maintained over time.
