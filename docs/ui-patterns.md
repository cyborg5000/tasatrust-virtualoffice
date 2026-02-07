# TASA Trust UI/UX Patterns

Last updated: 2026-02-07

## 1) Layout and Spacing

### Container and rhythm
- Use Tailwind container with centered alignment.
- Keep section spacing in consistent bands: `py-16`, `py-20`, `py-28`.
- Preserve strong vertical rhythm between headings, body copy, and CTAs.

### Surface language
- Use `surface-panel` for premium elevated cards.
- Surface traits:
  - Rounded corners (`2xl` feel)
  - Soft border
  - Light blur
  - Restrained shadow depth

## 2) Navigation Patterns

### Marketing navbar
- Sticky top behavior with subtle blur.
- On scroll: tighter height and stronger surface contrast.
- Desktop services dropdown must remain easy to target.
- Mobile menu uses clear grouped links and visible CTA actions.

### Footer pattern
- Dark (`secondary`) branded footer.
- Clear link columns (Company, Support, Legal).
- Contact channels always visible and clickable.

## 3) CTA and Conversion Patterns

### CTA composition
- One clear primary CTA per major section.
- Secondary CTA supports consultation or exploration.
- Maintain contrast-safe button colors against background.

### Pricing pattern
- Three tiers with annual toggle default.
- Clear "Most Popular" treatment on preferred plan.
- Simple, scannable feature lists with check icons.

## 4) Portal Shell Patterns

### Shared member/admin shell
- Left sidebar sticky to viewport.
- Top bar sticky.
- Content area handles vertical scroll.
- Sidebar and top bar should not scroll with content area.

### Role-aware navigation
- When user has admin role, show member-side quick link to admin portal.

## 5) Motion and Interaction

### Motion
- Keep animation minimal and meaningful.
- Current entry animation pattern: `animate-fade-up` (~700ms).

### Interaction quality bar
- Hover states should be subtle and immediate.
- Dropdown transitions must not cause accidental close.
- Touch targets must remain comfortable on mobile.

## 6) Accessibility Baseline

### Required checks
- Ensure readable contrast in every section and CTA block.
- Use semantic heading order and descriptive alt text.
- Keep forms with labels, validation, and clear error copy.
- Preserve keyboard accessibility for menus and nav actions.

### Guardrail
- Never allow text to inherit low-contrast colors from reusable surface classes without validation.

## 7) Implementation References

- Global design tokens: `src/index.css`
- Homepage composition: `src/pages/Index.tsx`
- Navigation: `src/components/layout/Navbar.tsx`
- Pricing: `src/components/pricing/PricingSection.tsx`
- Footer: `src/components/layout/Footer.tsx`
- Member shell: `src/components/member/MemberLayout.tsx`, `src/components/member/MemberSidebar.tsx`, `src/components/member/MemberTopBar.tsx`
- Admin shell: `src/components/admin/AdminLayout.tsx`, `src/components/admin/AdminSidebar.tsx`, `src/components/admin/AdminTopBar.tsx`
