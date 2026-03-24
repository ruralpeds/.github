# Creating Custom Themes

The Pediatric Emergency CDS uses a token-based theming system. Every visual property flows through CSS custom properties, which means changing the entire look of the application requires only a JSON object — no code changes, no recompilation.

## Quick Start: Create a Theme

1. Copy an existing preset as your starting point
2. Change the colors, shadows, or radii
3. Register it with `addCustomTheme()`

```typescript
import { addCustomTheme, setTheme } from '$lib/theme';
import type { Theme } from '$lib/theme';

const myHospitalTheme: Theme = {
  id: 'mercy-general',
  name: 'Mercy General',
  description: 'Custom theme for Mercy General Hospital ED',
  isDark: false,
  colors: {
    // Override only what you want to change — start from clinicalLight
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    surfaceOverlay: 'rgba(255, 255, 255, 0.95)',
    surfaceInset: '#F1F5F9',

    text: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    textInverse: '#F8FAFC',

    border: '#CBD5E1',
    borderSubtle: '#E2E8F0',
    borderStrong: '#94A3B8',

    // CLINICAL SEVERITY — DO NOT CHANGE THESE
    // These colors must remain consistent for patient safety
    emergency: '#DC2626',
    emergencyBg: '#FEF2F2',
    urgent: '#EA580C',
    urgentBg: '#FFF7ED',
    warning: '#CA8A04',
    warningBg: '#FEFCE8',
    stable: '#16A34A',
    stableBg: '#F0FDF4',
    info: '#2563EB',
    infoBg: '#EFF6FF',

    // Your hospital's brand color as the primary interactive color
    primary: '#0D9488',        // Mercy General teal
    primaryHover: '#0F766E',
    primaryActive: '#115E59',
    primaryText: '#FFFFFF',
    accent: '#6366F1',
    accentHover: '#4F46E5',

    // Decision tree nodes — keep consistent for clinical training
    nodeEmergency: '#EF4444',
    nodeUrgent: '#F97316',
    nodeDecision: '#EAB308',
    nodeAction: '#22C55E',
    nodeAssessment: '#3B82F6',
    nodeDiagnosis: '#A855F7',

    focusRing: '#0D9488',
    scrollbar: '#CBD5E1',
    scrollbarHover: '#94A3B8',
  },
  typography: {
    fontHeading: "'DM Serif Display', Georgia, serif",
    fontBody: "'IBM Plex Sans', system-ui, sans-serif",
    fontMono: "'IBM Plex Mono', Consolas, monospace",
    lineHeightBody: '1.6',
    lineHeightHeading: '1.2',
  },
  shadows: {
    sm: '0 1px 2px rgba(15, 23, 42, 0.05)',
    md: '0 4px 6px rgba(15, 23, 42, 0.07)',
    lg: '0 10px 15px rgba(15, 23, 42, 0.08)',
    popup: '0 12px 28px rgba(15, 23, 42, 0.12)',
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
};

// Register and activate
addCustomTheme(myHospitalTheme);
setTheme('mercy-general');
```

## Sharing Themes Across Devices

Themes are stored in `localStorage`. To share a theme with other devices or colleagues:

```typescript
import { exportTheme, importTheme, addCustomTheme } from '$lib/theme';

// Export
const json = exportTheme(myHospitalTheme);
// Copy `json` to clipboard, email, or save to a file

// Import on another device
const imported = importTheme(json);
if (imported) {
  addCustomTheme(imported);
}
```

## Theme Token Reference

### Colors

| Token | Purpose | Safe to customize? |
|---|---|---|
| `background` | Page background | Yes |
| `surface` | Card/panel backgrounds | Yes |
| `surfaceRaised` | Elevated elements (modals, dropdowns) | Yes |
| `surfaceInset` | Recessed areas (code blocks, inputs) | Yes |
| `text` | Primary text | Yes |
| `textSecondary` | Secondary text | Yes |
| `textMuted` | Tertiary/hint text | Yes |
| `primary` | Interactive elements, links, buttons | Yes — use your brand color |
| `accent` | Secondary interactive color | Yes |
| `emergency` | Critical/life-threatening alerts | **NO** — patient safety |
| `urgent` | Urgent clinical alerts | **NO** — patient safety |
| `warning` | Warning indicators | **NO** — patient safety |
| `stable` | Stable/normal indicators | **NO** — patient safety |
| `nodeEmergency` – `nodeDiagnosis` | Decision tree node colors | **Caution** — affects clinical training |

### Typography

| Token | Default |
|---|---|
| `fontHeading` | DM Serif Display |
| `fontBody` | IBM Plex Sans |
| `fontMono` | IBM Plex Mono |

You can change fonts but ensure the mono font has clear distinction between `0`/`O` and `1`/`l` — critical for reading medication doses.

## Safety Rules

1. **Never modify clinical severity colors.** Red means emergency everywhere. Changing this color coding creates a patient safety risk.
2. **Decision tree node colors should remain consistent** across all devices in a facility so clinical training transfers.
3. **Ensure sufficient contrast.** Use the WCAG contrast checker to verify text is readable against backgrounds. Minimum 4.5:1 for body text.
4. **Test in actual ED lighting.** Fluorescent overhead lighting washes out subtle color differences.
