# ADX Engine Brand Specification
*Agent-ready design system. Apply this to any ADX Engine project or client deliverable.*

---

## Identity

**Company:** ADX Engine
**What we do:** Install AI operators into marketing team workflows. We replace manual production roles with autonomous systems embedded directly in the client's existing workflow.
**Founder:** Renaldo Edmondson — 13 years in marketing operations, VP-level, Marketing Systems Architect.
**Position:** We don't advise. We don't sell tools. We install operators.

---

## Color System

Always use these exact values. Never approximate.

```css
/* Backgrounds — dark navy, never pure black */
--navy-950: #0A1929;   /* Page/app background — always use this as the base */
--navy-900: #0D2137;   /* Card surfaces, panels */
--navy-800: #152B3C;   /* Elevated cards, modals, drawers */
--navy-700: #1A3A52;   /* Borders, dividers */
--navy-600: #234B68;   /* Hover state backgrounds */

/* Primary accent — teal */
--teal-500: #009696;   /* Interactive elements, primary CTAs, active borders */
--teal-400: #00B4B4;   /* Headline accents, active states, icons, highlights */
--teal-300: #33C7C7;   /* Hover tints, subtle glows */

/* Typography */
--slate-100: #F1F5F9;  /* Primary headings — near white */
--slate-200: #E2E8F0;  /* Secondary headings */
--slate-300: #CBD5E1;  /* Body copy */
--slate-400: #94A3B8;  /* Muted text, descriptions, captions */
--slate-500: #64748B;  /* Labels, metadata, divider text */
--slate-600: #475569;  /* Very muted — section labels, placeholder text */
```

### Color Rules

- Background is always `#0A1929`. Never use pure black (`#000`) as a background.
- Teal `#00B4B4` is for accents, highlights, and the key phrase in hero headlines.
- Teal `#009696` is for interactive elements: buttons, CTAs, links.
- Use teal at 5–12% opacity for surface tints (`rgba(0,150,150,0.08)`) and ambient glows.
- Never put the logo or teal text on a light background.
- Status colors: `#00B4B4` (live/active), `#F59E0B` (in-progress/warning), `#475569` (inactive/planned).

---

## Typography

**Font:** Plus Jakarta Sans — always load from Google Fonts.

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

### Type Scale

| Role | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|
| Display / Hero H1 | 64px (mobile: 40px) | 800 | -0.04em | 0.92 |
| H2 | 40px (mobile: 28px) | 800 | -0.03em | 1.1 |
| H3 | 24px | 700 | -0.02em | 1.2 |
| Body | 16px | 400 | 0 | 1.7 |
| Body small | 14px | 400 | 0 | 1.6 |
| Table / data | 13px | 400–500 | 0 | 1.5 |
| Label / badge | 10px | 500 | 0.2em | 1 |
| Micro / caption | 11px | 400–500 | 0.12em | 1.4 |

---

## Component Patterns

### Pill Badge

```css
.badge {
  display: inline-block;
  padding: 5px 14px;
  border-radius: 999px;
  background: rgba(0, 150, 150, 0.1);
  border: 1px solid rgba(0, 150, 150, 0.2);
  color: #00B4B4;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

/* Status variants */
.badge-live    { background: rgba(0,150,150,0.10); border-color: rgba(0,150,150,0.25); color: #00B4B4; }
.badge-build   { background: rgba(245,158,11,0.10); border-color: rgba(245,158,11,0.25); color: #FBBF24; }
.badge-concept { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); color: #64748B; }
```

### Primary Button (teal pill)

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 8px 12px 28px;
  background: #009696;
  color: #0A1929;
  font-family: inherit;
  font-weight: 600;
  font-size: 15px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.3s ease;
}
.btn-primary:hover { background: #00B4B4; }
.btn-primary .arrow {
  width: 36px; height: 36px;
  background: rgba(10,25,41,0.12);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
```

### Ghost Button

```css
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: transparent;
  color: #CBD5E1;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}
.btn-ghost:hover { color: #F1F5F9; border-color: rgba(255,255,255,0.2); }
```

### Standard Card

```css
.card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  padding: 24px;
}
```

### Nested Card (elevated / dashboard style)

```css
.card-outer {
  padding: 6px;
  border-radius: 24px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
}
.card-inner {
  border-radius: 20px;
  background: rgba(13,33,55,0.8);
  padding: 24px;
}
```

### Teal-accented Card (primary / featured)

```css
.card-accent {
  padding: 6px;
  border-radius: 24px;
  background: rgba(0,150,150,0.07);
  border: 1px solid rgba(0,150,150,0.2);
}
.card-accent-inner {
  border-radius: 20px;
  background: rgba(10,25,41,0.6);
  padding: 24px;
}
```

### Section Label

```css
.section-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #64748B;
  margin-bottom: 24px;
}
```

### Teal Left-border Callout

```css
.callout {
  border-left: 2px solid rgba(0,150,150,0.3);
  padding: 4px 0 4px 16px;
}
.callout-label {
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #64748B;
  margin-bottom: 6px;
}
```

### Highlight Block

```css
.highlight-block {
  background: rgba(0,150,150,0.06);
  border: 1px solid rgba(0,150,150,0.2);
  border-radius: 16px;
  padding: 20px;
  color: rgba(51,199,199,0.8);
  font-size: 14px;
  line-height: 1.6;
}
```

### Data Table

```css
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead tr {
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.data-table th {
  text-align: left;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #475569;
  padding: 10px 16px;
}
.data-table td {
  font-size: 13px;
  color: #94A3B8;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.data-table tr:hover td { background: rgba(255,255,255,0.02); }
.data-table .td-primary { color: #CBD5E1; font-weight: 500; }
.data-table .td-accent  { color: #00B4B4; font-family: monospace; font-size: 12px; }
.data-table .td-muted   { color: #475569; font-size: 12px; }
```

### Status Dot Indicator

```css
.dot-live     { width: 8px; height: 8px; border-radius: 50%; background: #00B4B4;
                box-shadow: 0 0 8px rgba(0,180,180,0.5); animation: pulse 2s infinite; }
.dot-pending  { width: 8px; height: 8px; border-radius: 50%; background: #F59E0B; }
.dot-inactive { width: 6px; height: 6px; border-radius: 50%; background: #334155; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Ambient Glow Orb

```css
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  z-index: 0;
}
.glow-teal    { background: rgba(0,150,150,0.08); width: 600px; height: 600px; }
.glow-teal-sm { background: rgba(0,180,180,0.05); width: 400px; height: 400px; }
```

### Step / Pipeline Item

```css
.step-number {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: #0A1929;
  border: 1px solid rgba(0,150,150,0.3);
  display: flex; align-items: center; justify-content: center;
  color: #00B4B4;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}
```

---

## Dividers

```css
/* Standard */
border-top: 1px solid rgba(255,255,255,0.05);

/* Teal gradient */
height: 1px;
background: linear-gradient(to right, rgba(0,150,150,0.4), rgba(0,150,150,0.15), transparent);
```

---

## Layout Principles

- **Max content width:** 1200px, centered, `margin: 0 auto`
- **Horizontal padding:** 24px mobile, 32px desktop
- **Section vertical spacing:** 120px between sections (80px on mobile)
- **Responsive breakpoint:** 768px (md)
- **Border radius scale:** page/modal = 32px, card = 20px, button = 999px, badge = 999px, table = 16px
- **Z-axis order:** background (0) → content (1) → nav (50) → modal (100)

---

## Dashboard-Specific Patterns

For operator dashboards, client portals, and data interfaces:

### Sidebar Navigation

```css
.sidebar {
  width: 240px;
  background: #0D2137;
  border-right: 1px solid rgba(255,255,255,0.05);
  height: 100vh;
  position: fixed;
  left: 0; top: 0;
  padding: 24px 16px;
}
.sidebar-link {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; border-radius: 10px;
  font-size: 13px; color: #64748B;
  text-decoration: none;
  transition: all 0.2s;
}
.sidebar-link:hover { background: rgba(255,255,255,0.04); color: #94A3B8; }
.sidebar-link.active { background: rgba(0,150,150,0.1); color: #00B4B4; }
```

### Top Bar (dashboard header)

```css
.topbar {
  height: 60px;
  background: rgba(10,25,41,0.95);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  backdrop-filter: blur(16px);
  display: flex; align-items: center;
  padding: 0 24px;
  position: sticky; top: 0; z-index: 50;
}
```

### Stat Card

```css
.stat-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 20px 24px;
}
.stat-value {
  font-size: 32px; font-weight: 800;
  letter-spacing: -0.04em; color: #F1F5F9;
  line-height: 1;
}
.stat-label {
  font-size: 11px; font-weight: 500;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: #475569; margin-top: 8px;
}
.stat-delta-up   { font-size: 12px; color: #00B4B4; margin-top: 6px; }
.stat-delta-down { font-size: 12px; color: #F87171; margin-top: 6px; }
```

### Empty State

```css
.empty-state {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 60px 24px; text-align: center;
  color: #475569;
}
.empty-state-icon { font-size: 32px; margin-bottom: 16px; opacity: 0.4; }
.empty-state-title { font-size: 15px; font-weight: 600; color: #64748B; margin-bottom: 8px; }
.empty-state-body  { font-size: 13px; color: #475569; max-width: 36ch; line-height: 1.6; }
```

---

## Animation

```css
/* Scroll reveal (web pages) */
.reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
.reveal.revealed { opacity: 1; transform: translateY(0); }

/* Fade in (modals, panels) */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* Slide up (bottom sheets, toasts) */
@keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

/* Standard easing */
--ease-smooth: cubic-bezier(0.32, 0.72, 0, 1);

/* Duration scale */
--duration-fast:   200ms;
--duration-normal: 300ms;
--duration-slow:   500ms;
--duration-reveal: 700ms;
```

---

## Voice & Tone

### Core Rules

- **Short sentences. One idea each.** No compound sentences joined with "and" when two sentences would be cleaner.
- **Say what it does.** Not what it "enables," "empowers," or "helps." Direct verbs only.
- **No filler:** leverage, optimize, innovative, cutting-edge, seamless, robust, comprehensive, holistic, synergy, empower, game-changing, results-focused.
- **Concrete language:** specific outcomes, real verbs, numbers when possible.
- **Conviction tone:** slightly uncomfortable truth-telling.
- **Active voice always.**

### Vocabulary

Use: operators, systems, pipeline, execution, diagnostic, build, workflow, constraints, output, production, installation, mapping, embedded, autonomous, scoped, deployed.

### The Core Distinction (Always Maintain)

> **Tools are used. Operators are deployed.**

A tool requires a human to run it. An ADX Operator performs the execution role itself — embedded in the workflow, running on schedule, delivering output without human initiation.

### Copy Substitutions

| Instead of | Say |
|---|---|
| "We help you implement AI..." | "We install AI operators into your workflow." |
| "AI-assisted workflows" | "Workflows with the manual layer removed." |
| "Automated operators" | "AI operators" |
| "Focus on strategy, not execution" | "The system does the execution. You review the output." |
| "Results-focused" | Remove. State the specific result instead. |
| "Measurable outcomes" | Remove. State what is measured instead. |

---

## Tailwind Reference (if using Tailwind CSS)

```
bg-[#0A1929]     navy-950 background
bg-[#0D2137]     navy-900 surface
bg-[#152B3C]     navy-800 elevated
border-white/[0.06]   standard border
border-white/[0.08]   slightly visible border
text-teal-400    #00B4B4
text-slate-400   #94A3B8
text-slate-500   #64748B
bg-teal-500/10   teal tint surface
border-teal-500/20   teal border
rounded-[20px]   card radius
rounded-full     badge/button radius
```

---

*Source: adxengine.net | design-system/BRAND.md*
*Update this file when brand decisions change.*
