# TASA Trust Visual Identity Guidelines

Last updated: 2026-02-07

## 1) Color System

Source of truth: `src/index.css`

### Core brand palette
- Primary gold: `hsl(39 47% 56%)`
- Secondary navy: `hsl(222 47% 11%)`
- Background: `hsl(0 0% 100%)`
- Foreground: `hsl(222 47% 11%)`
- Muted background: `hsl(220 22% 96%)`
- Muted text: `hsl(220 10% 40%)`
- Border: `hsl(220 14% 88%)`

### Semantic usage
- `primary`: highlights, chips, icon accents, word emphasis.
- `secondary`: trust surfaces, footer, dark overlays, portal sidebars.
- `muted`: low-emphasis backgrounds and support text.

### Contrast rules
- Use white/near-white text on `secondary` dark surfaces.
- Use `foreground`/`secondary` on light surfaces.
- Do not use white text on translucent light panels.

## 2) Typography

### Font families
- Body/UI: Manrope (`400, 500, 600, 700, 800`)
- Headings: Fraunces (`500, 700`)

### Hierarchy
- H1: `text-4xl` to `text-6xl`
- H2: `text-3xl` to `text-4xl`
- Body: `text-base` to `text-lg`
- Support text: `text-sm` + muted color

### Typographic behavior
- Headings use tighter tracking (`-0.02em`).
- Section labels use uppercase and wider tracking (`~0.14em-0.16em`).

## 3) Imagery

### Style
- Use realistic business photography.
- Themes: office, collaboration, handshake, corporate buildings.
- Visual intent: trust, credibility, readiness, professionalism.

### Current assets
- `src/assets/hero-office.jpg`
- `src/assets/workspace-professional.jpg`
- `src/assets/team-meeting.jpg`
- `src/assets/corporate-building.jpg`
- `src/assets/business-handshake.jpg`

### Treatment
- Use dark overlays for text readability on image backgrounds.
- Avoid over-processing, heavy filters, and over-saturation.

## 4) Iconography

### System
- Use Lucide icons consistently.
- Keep icon style simple and line-based.

### Usage
- Use icons as support, not decoration-heavy noise.
- Prefer primary color for feature highlights.

## 5) Brand Assets

### Logo
- Primary logo: `src/assets/logo.png`
- Use inverted treatment on dark surfaces.

### Favicon
- Source file: `public/images/favicon.png`
- Reference in head: `/images/favicon.png`
