// Design tokens for AI OS
// Following Vercel, Linear, Claude design principles

export const colors = {
  // Dark theme colors
  dark: {
    background: {
      primary: '#0a0a0a',
      secondary: '#111111',
      tertiary: '#171717',
      elevated: '#1a1a1a',
      overlay: 'rgba(0, 0, 0, 0.8)',
    },
    foreground: {
      primary: '#ffffff',
      secondary: '#a1a1aa',
      tertiary: '#71717a',
      muted: '#52525b',
    },
    border: {
      default: '#27272a',
      subtle: '#1f1f23',
      muted: '#3f3f46',
    },
    accent: {
      blue: '#3b82f6',
      green: '#22c55e',
      red: '#ef4444',
      yellow: '#eab308',
      purple: '#a855f7',
      cyan: '#06b6d4',
    },
  },
  // Light theme colors
  light: {
    background: {
      primary: '#ffffff',
      secondary: '#fafafa',
      tertiary: '#f4f4f5',
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    foreground: {
      primary: '#18181b',
      secondary: '#71717a',
      tertiary: '#a1a1aa',
      muted: '#d4d4d8',
    },
    border: {
      default: '#e4e4e7',
      subtle: '#f4f4f5',
      muted: '#d4d4d8',
    },
    accent: {
      blue: '#2563eb',
      green: '#16a34a',
      red: '#dc2626',
      yellow: '#ca8a04',
      purple: '#9333ea',
      cyan: '#0891b2',
    },
  },
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    display: ['Cal Sans', 'Inter', 'sans-serif'],
  },
  fontSize: {
    xs: { value: '0.75rem', lineHeight: '1rem' },
    sm: { value: '0.875rem', lineHeight: '1.25rem' },
    base: { value: '1rem', lineHeight: '1.5rem' },
    lg: { value: '1.125rem', lineHeight: '1.75rem' },
    xl: { value: '1.25rem', lineHeight: '1.75rem' },
    '2xl': { value: '1.5rem', lineHeight: '2rem' },
    '3xl': { value: '1.875rem', lineHeight: '2.25rem' },
    '4xl': { value: '2.25rem', lineHeight: '2.5rem' },
    '5xl': { value: '3rem', lineHeight: '1.1' },
    '6xl': { value: '3.75rem', lineHeight: '1.1' },
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',     // 4px
  DEFAULT: '0.375rem', // 6px
  md: '0.5rem',      // 8px
  lg: '0.75rem',     // 12px
  xl: '1rem',        // 16px
  '2xl': '1.5rem',   // 24px
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  glow: {
    blue: '0 0 20px rgba(59, 130, 246, 0.3)',
    green: '0 0 20px rgba(34, 197, 94, 0.3)',
    purple: '0 0 20px rgba(168, 85, 247, 0.3)',
  },
} as const;

export const animations = {
  duration: {
    fast: '150ms',
    DEFAULT: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  keyframes: {
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    fadeOut: {
      from: { opacity: '1' },
      to: { opacity: '0' },
    },
    slideIn: {
      from: { transform: 'translateY(-10px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    slideInRight: {
      from: { transform: 'translateX(100%)', opacity: '0' },
      to: { transform: 'translateX(0)', opacity: '1' },
    },
    slideInUp: {
      from: { transform: 'translateY(100%)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    scaleIn: {
      from: { transform: 'scale(0.95)', opacity: '0' },
      to: { transform: 'scale(1)', opacity: '1' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
  },
} as const;

export const zIndex = {
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
  tooltip: 1600,
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// CSS Custom Properties export
export const cssVariables = `
  :root {
    /* Colors - Light Theme (default) */
    --color-background-primary: ${colors.light.background.primary};
    --color-background-secondary: ${colors.light.background.secondary};
    --color-background-tertiary: ${colors.light.background.tertiary};
    --color-foreground-primary: ${colors.light.foreground.primary};
    --color-foreground-secondary: ${colors.light.foreground.secondary};
    --color-foreground-tertiary: ${colors.light.foreground.tertiary};
    --color-border-default: ${colors.light.border.default};
    --color-border-subtle: ${colors.light.border.subtle};
    --color-accent-blue: ${colors.light.accent.blue};
    --color-accent-green: ${colors.light.accent.green};
    --color-accent-red: ${colors.light.accent.red};
    --color-accent-yellow: ${colors.light.accent.yellow};
    --color-accent-purple: ${colors.light.accent.purple};
    --color-accent-cyan: ${colors.light.accent.cyan};

    /* Typography */
    --font-family-sans: ${typography.fontFamily.sans.join(', ')};
    --font-family-mono: ${typography.fontFamily.mono.join(', ')};
    
    /* Spacing */
    --spacing-1: ${spacing[1]};
    --spacing-2: ${spacing[2]};
    --spacing-3: ${spacing[3]};
    --spacing-4: ${spacing[4]};
    --spacing-5: ${spacing[5]};
    --spacing-6: ${spacing[6]};
    --spacing-8: ${spacing[8]};
    --spacing-10: ${spacing[10]};
    --spacing-12: ${spacing[12]};
    --spacing-16: ${spacing[16]};

    /* Border Radius */
    --radius-sm: ${borderRadius.sm};
    --radius-md: ${borderRadius.DEFAULT};
    --radius-lg: ${borderRadius.lg};
    --radius-xl: ${borderRadius.xl};
    --radius-full: ${borderRadius.full};

    /* Shadows */
    --shadow-sm: ${shadows.sm};
    --shadow-md: ${shadows.md};
    --shadow-lg: ${shadows.lg};
    --shadow-xl: ${shadows.xl};

    /* Animations */
    --duration-fast: ${animations.duration.fast};
    --duration-default: ${animations.duration.DEFAULT};
    --duration-slow: ${animations.duration.slow};
    --ease-default: ${animations.easing.DEFAULT};
  }

  .dark {
    --color-background-primary: ${colors.dark.background.primary};
    --color-background-secondary: ${colors.dark.background.secondary};
    --color-background-tertiary: ${colors.dark.background.tertiary};
    --color-foreground-primary: ${colors.dark.foreground.primary};
    --color-foreground-secondary: ${colors.dark.foreground.secondary};
    --color-foreground-tertiary: ${colors.dark.foreground.tertiary};
    --color-border-default: ${colors.dark.border.default};
    --color-border-subtle: ${colors.dark.border.subtle};
  }
`;

// Export theme helper type
export type Theme = 'light' | 'dark';

export interface ThemeConfig {
  theme: Theme;
  colors: typeof colors.light | typeof colors.dark;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  animations: typeof animations;
}