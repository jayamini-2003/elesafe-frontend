// constants/theme.ts
// ─── EleSafe Lanka — Algae Palette ───────────────────────────────────────────
//   #1B7148  Deep algae green (darkest)
//   #3A8070  Rich teal-green
//   #A2BA64  Light sage / lime green
//   #E8E8ED  Soft neutral gray

import { ViewStyle } from 'react-native';

// ── Raw palette ───────────────────────────────────────────────────────────────
export const PALETTE = {
  deepForest:   '#0D3B22',   // dark forest green — header & drawer
  richForest:   '#1A6B40',   // primary brand / buttons
  sage:         '#A2BA64',   // light lime-sage accent
  mist:         '#C4D9CB',   // muted borders / icons
  cream:        '#EDF5E6',   // lightest background
  white:        '#FFFFFF',
  danger:       '#C0392B',
  dangerLight:  '#FDEDEC',
  warning:      '#D4880E',
  warningLight: '#FEF9E7',
  overlay:      'rgba(13,59,34,0.65)',
} as const;

// ── Shadow helper ─────────────────────────────────────────────────────────────
type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

const shadow: Record<string, ShadowStyle> = {
  card: {
    shadowColor:   '#0D3B22',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius:  8,
    elevation:     3,
  },
  strong: {
    shadowColor:   '#0D3B22',
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius:  16,
    elevation:     8,
  },
  drawer: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 6, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius:  18,
    elevation:     24,
  },
};

// ── Theme object ──────────────────────────────────────────────────────────────
export const theme = {
  colors: {
    // Backgrounds
    bg:           PALETTE.cream,
    bgSubtle:     '#E2EFE7',
    surface:      PALETTE.white,
    surfaceAlt:   '#F4F9EF',

    // Brand
    primary:      PALETTE.richForest,   // #1B6B45
    primaryDark:  PALETTE.deepForest,   // #0B3D22
    primaryLight: PALETTE.sage,
    primaryMist:  PALETTE.mist,
    primaryCream: PALETTE.cream,

    // Header / nav
    header:       PALETTE.deepForest,
    headerText:   PALETTE.cream,
    headerIcon:   PALETTE.mist,

    // Drawer
    drawer:       PALETTE.deepForest,
    drawerActive: PALETTE.richForest,
    drawerText:   PALETTE.cream,
    drawerMuted:  PALETTE.mist,

    // Text
    text:          '#0D2B18',
    textSecondary: '#1A6B40',
    textMuted:     '#4A7A5A',
    textOnDark:    PALETTE.cream,

    // Status
    danger:       PALETTE.danger,
    dangerLight:  PALETTE.dangerLight,
    warning:      PALETTE.warning,
    warningLight: PALETTE.warningLight,
    success:      PALETTE.richForest,

    // Inputs / borders
    border:      PALETTE.mist,
    inputBg:     PALETTE.white,
    inputBorder: '#A8C4B0',
    placeholder: '#7AA88C',

    // Aliases
    deepForest:  PALETTE.deepForest,
    richForest:  PALETTE.richForest,
    sage:        PALETTE.sage,
    mist:        PALETTE.mist,
    cream:       PALETTE.cream,
    white:       PALETTE.white,
  },

  spacing: {
    xs:  6,
    sm:  10,
    md:  16,
    lg:  20,
    xl:  28,
    xxl: 40,
  },

  radius: {
    xs:   6,
    sm:   10,
    md:   14,
    lg:   20,
    xl:   28,
    full: 999,
  },

  shadow,
};

export default theme;

// ── Convenience colour exports ─────────────────────────────────────────────────
export const deepForest = PALETTE.deepForest;
export const richForest = PALETTE.richForest;
export const sage       = PALETTE.sage;
export const mist       = PALETTE.mist;
export const cream      = PALETTE.cream;
