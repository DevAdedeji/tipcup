
const token = (name) => `hsl(var(--${name}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: [
    './app/components/**/*.{js,vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/composables/**/*.{js,ts}',
    './app/utils/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue',
  ],
  theme: {
    extend: {
      colors: {
        background: token('background'),
        surface: {
          DEFAULT: token('surface'),
          hover: token('surface-hover'),
          sunken: token('surface-sunken'),
        },

        border: {
          DEFAULT: token('border'),
          strong: token('border-strong'),
        },
        input: token('input'),
        ring: token('ring'),

        text: {
          primary: token('text-primary'),
          secondary: token('text-secondary'),
          tertiary: token('text-tertiary'),
        },

        primary: {
          DEFAULT: token('primary'),
          foreground: token('primary-foreground'),
        },
        secondary: {
          DEFAULT: token('secondary'),
          foreground: token('secondary-foreground'),
        },
        accent: {
          DEFAULT: token('accent'),
          foreground: token('accent-foreground'),
          muted: token('accent-muted'),
        },
        muted: {
          DEFAULT: token('muted'),
          foreground: token('muted-foreground'),
        },

        success: {
          DEFAULT: token('success'),
          foreground: token('success-foreground'),
          muted: token('success-muted'),
        },
        warning: {
          DEFAULT: token('warning'),
          foreground: token('warning-foreground'),
          muted: token('warning-muted'),
        },
        error: {
          DEFAULT: token('error'),
          foreground: token('error-foreground'),
          muted: token('error-muted'),
        },
        info: {
          DEFAULT: token('info'),
          foreground: token('info-foreground'),
          muted: token('info-muted'),
        },

        tertiary: token('accent'),
      },

      fontFamily: {
        sans: ['Karla', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'ui-serif', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        xs: ['0.75rem', { lineHeight: '1.125rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.875rem', { lineHeight: '1.375rem' }],
        md: ['0.9375rem', { lineHeight: '1.5rem' }],
        lg: ['1.0625rem', { lineHeight: '1.625rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.017em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.021em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        '6xl': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.033em' }],
        '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.035em' }],
      },

      // Cloth has soft edges, but a weave is orthogonal. Small radii read as
      // crafted; anything larger reads as a generic app.
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '3px',
        md: '3px',
        lg: '4px',
        xl: '6px',
        '2xl': '8px',
        '3xl': '10px',
        full: '9999px',
      },

      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        focus: '0 0 0 3px hsl(var(--ring) / 0.35)',
        accent: '0 8px 24px -6px hsl(var(--accent) / 0.4)',
        none: 'none',
      },

      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },

      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        rise: 'rise 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in-up': 'rise 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
        'scale-in': 'scale-in 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
      },

      letterSpacing: {
        label: '0.13em',
      },

      maxWidth: {
        content: '72rem',
      },
    },
  },
  plugins: [],
}
