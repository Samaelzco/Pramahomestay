---
name: Urban Sanctuary
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#795830'
  on-secondary: '#ffffff'
  secondary-container: '#ffd2a1'
  on-secondary-container: '#7a5930'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#121c29'
  on-tertiary-container: '#7a8495'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#ffddb9'
  secondary-fixed-dim: '#eabf8e'
  on-secondary-fixed: '#2b1700'
  on-secondary-fixed-variant: '#5f411b'
  tertiary-fixed: '#d9e3f5'
  tertiary-fixed-dim: '#bdc7d9'
  on-tertiary-fixed: '#121c29'
  on-tertiary-fixed-variant: '#3e4756'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

This design system embodies the "Urban Sanctuary"—a bridge between the raw, industrial energy of the city and the organic warmth of a premium homestay. The personality is curated, modern, and quiet, providing a high-end residential feel that prioritizes clarity and calm.

The design style is **Sophisticated Minimalism** with **Tactile accents**. It leverages heavy whitespace and a strict adherence to a grid to reflect architectural precision. To prevent the interface from feeling cold, the digital experience incorporates "material warmth" through the strategic use of wood-toned accents and high-fidelity photography. Visuals are characterized by clean lines, generous breathing room, and a focus on essentialism.

## Colors

The palette is rooted in a high-contrast urban foundation, balanced by organic warmth.

- **Primary (Deep Charcoal):** Used for primary actions, headings, and high-impact structural elements. It provides the "urban" weight.
- **Secondary (Oak/Walnut):** A warm, sophisticated wood tone used sparingly for interactive highlights, active states, and premium call-outs to evoke the homestay’s physical interior.
- **Tertiary (Slate Gray):** A muted, professional tone used for secondary text, icons, and borders to provide depth without adding visual noise.
- **Neutral/Crisp White:** The primary canvas. Use pure white for surfaces and a very light gray (#F9F9F9) for subtle section differentiation.
- **Dark mode:** Use warm charcoal layers (`#111313`, `#191B1B`, `#202323`) instead of pure black, with soft off-white text (`#F2F1EF`) and a brighter wood accent (`#D8AE7B`). Preserve tonal separation between the page, cards, controls, and inverse primary actions.

The internal header exposes the theme control in its trailing edge: opposite the menu trigger on compact screens and after the page context on desktop. The first visit follows the operating-system preference; an explicit light or dark choice is persisted for future visits.

## Typography

The design system utilizes **Inter** exclusively to maintain a utilitarian, modern, and highly legible aesthetic. 

The typographic hierarchy relies on tight tracking and intentional leading to create an editorial feel. Display styles should use semi-bold weights with negative letter-spacing to mimic architectural signage. Body text is set with generous line height to ensure readability against a minimalist backdrop. Use the `label-caps` style for category markers or small metadata to introduce a structured, "organized" feel to the layout.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model on desktop and a **Fluid Grid** on mobile, emphasizing "Spaciousness" as a core brand pillar.

- **Grid:** Use a 12-column grid for desktop (1280px max-width) with large 24px gutters.
- **Margins:** Desktop margins should be at least 80px to create a "framed" gallery feel. Mobile margins are set to 24px.
- **Rhythm:** Use an 8px base unit. Vertical spacing between major sections should be aggressive (`xl` or 80px) to allow photography to breathe.
- **Alignment:** Content should predominantly align to the left to maintain a clean, structured edge, echoing modern urban architecture.

## Elevation & Depth

This design system avoids heavy drop shadows in favor of **Tonal Layers** and **Subtle Ambient Shadows**.

Depth is communicated through:
1.  **Layering:** Placing elements on slightly different neutral backgrounds (e.g., a white card on a #F4F4F4 surface).
2.  **Shadows:** When necessary, use a "Whisper Shadow"—a very large blur radius (32px+) with extremely low opacity (4-6%) and a slight Slate Gray tint. This should feel like natural ambient light, not a digital effect.
3.  **Interaction:** Elevate elements slightly on hover using a subtle vertical shift (-2px) rather than increasing shadow intensity.

## Shapes

The shape language is **Soft (0.25rem)**. 

While the layout is modern and "linear," strictly sharp corners are avoided to ensure the brand feels hospitable and residential rather than cold or institutional. 
- Standard components (Buttons, Inputs) use `rounded-sm`.
- Large containers and imagery use `rounded-lg` (0.5rem) to provide a gentle "frame" for photography.
- Avoid pill-shapes entirely to maintain the architectural, grid-based aesthetic.

## Components

- **Buttons:** Primary buttons are Solid Charcoal with White text. Secondary buttons are Outline (Slate Gray) or Ghost. The "Warm Wood" color is reserved for high-intent "Book Now" actions or active selection states.
- **Inputs:** Minimalist bottom-border only or very light Slate Gray outlines. On focus, the border transitions to Deep Charcoal. Labels use the `label-caps` style.
- **Cards:** Use white backgrounds with "Whisper Shadows." Public and editorial cards remain photography-led, typically giving imagery the top 60-70% of the card area. Internal operational cards are data-led: use tonal surfaces, fine dividers, tabular numerals, and restrained ambient shadow instead of forcing imagery into analytical content.
- **Chips/Tags:** Used for amenities (e.g., "High-speed Wi-Fi"). Use a light gray fill with Slate Gray text; no borders.
- **Lists:** Clean, high-contrast list items separated by thin 1px lines in light slate (#E1E4E8).
- **Navigation:** Public navigation uses a persistent, minimal top-bar with plenty of padding. Internal tools use a persistent sidebar from `1280px` upward; phone and tablet layouts use the modal drawer so operational content keeps full width. Retain the Secondary (Wood) active state, `aria-current`, keyboard dismissal, focus containment, and focus return.
- **Tablet adaptation:** Between `640px` and `1279px`, filters and labeled data cards use two-column reflow, forms keep comfortable field widths, and landscape layouts may promote data cards back to full tables when content fits without horizontal scroll.
