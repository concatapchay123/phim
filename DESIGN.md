# Design System: Quán Chill

This document outlines the visual system, styles, and assets for the **Quán Chill** cinema streaming website.

## Color Strategy: Seal Lounge (Warm Dark, Gold & Deep Vermilion)

We use deep cinematic dark tones, muted gold, and deep vermilion seal accents to create a calm lounge atmosphere with a light costume-drama character.

### Color Palette (OKLCH)

All colors are defined using the OKLCH color space for uniform brightness and rich saturation.

Current brand accents also include `--seal-red`, `--seal-red-deep`, and `--seal-ink` for the calligraphic logo seal.

- **Base Background (`--bg-base`)**: `oklch(12% 0.01 20)` — Deep, rich near-black.
- **Surface Accent (`--bg-surface`)**: `oklch(18% 0.01 20)` — Card backgrounds and list panels.
- **Surface Hover (`--bg-surface-hover`)**: `oklch(24% 0.01 20)` — Interactive element hover states.
- **Primary Red (`--primary`)**: `oklch(55% 0.22 25)` — Cinematic red (anchor color).
- **Primary Hover (`--primary-hover`)**: `oklch(60% 0.24 25)` — Vibrant red for hover states.
- **Primary Glass (`--primary-glass`)**: `oklch(55% 0.22 25 / 15%)` — Transparent red for backgrounds.
- **Text Primary (`--text-primary`)**: `oklch(95% 0.01 20)` — Near-white for high legibility.
- **Text Secondary (`--text-secondary`)**: `oklch(70% 0.01 20)` — Cool gray for metadata.
- **Text Muted (`--text-muted`)**: `oklch(50% 0.01 20)` — Subtitle labels and borders.

## Typography

- **Font Family**: `'Outfit', sans-serif` (Google Fonts).
- **Hero/Display Heading**: `clamp(2rem, 5vw, 4rem)` with `letter-spacing: -0.02em` and `line-height: 1.1`.
- **Section Heading**: `clamp(1.5rem, 3vw, 2.2rem)` with `letter-spacing: -0.01em`.
- **Body Text**: `1rem` with `line-height: 1.6`, maximum length `65-75ch`.

## Layout & Components

### Navbar
- Fixed floating navigation with a warm glass surface, soft gold border, and relaxed shadow.
- Custom inline SVG logo using a rounded calligraphic seal motif, a subtle QC-style brush mark, and a small play cut so the brand still reads as a movie site.
- Header motion should feel slow and settled; avoid sharp spins, flashy glow, or overly techy glass effects.

### Hero Section (Featured Movie)
- Large, high-impact bento-style cover image using CSS gradient masking.
- Action buttons: Play (solid red) and Info (glass background).
- Quick tags with smooth hover transition.

### Movie Cards
- **Dimensions**: Aspect ratio `2/3`.
- **Borders & Shadows**: Clean borders `1px solid oklch(24% 0.01 20)`, no large fuzzy shadows.
- **Hover Micro-motion**: Card scales up slightly `scale(1.03)` with a smooth transform transition, movie poster zoom `scale(1.05)`.
- **Badges**: Red HD badge on the top-left, dark glass Vietsub/Thuyết Minh badge on the top-right.

### Horizontal Rows & Grids
- Flat horizontal lists with hidden scrollbars, navigated by sleek red scroll buttons.
- Grid pages: responsive auto-fit grid (`repeat(auto-fit, minmax(180px, 1fr))`).

### Cinematic Modals
- Modal dialog with custom deep-blur background (`backdrop-filter: blur(25px)`).
- Modal layout divided into two clean zones: a visual top-header (wide backdrop image, poster, title, quick tags) and details bottom-body (synopsis text and movie specs list).

## Motion System (GSAP)

- **Page Transitions**: Smooth slide & fade transition when changing pages.
- **Row Reveals**: ScrollTrigger staggers movie card loading inside rows.
- **Modal Animations**: Scale-up and fade-in modal container using `power4.out` easing.
- **Hover Micro-motions**: GSAP interactive hover states on primary CTAs.
