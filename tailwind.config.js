/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // HIG Color System
        primary: {
          50: '#fef7f0',
          100: '#fdeee0',
          200: '#fbd9c1',
          300: '#f8c4a2',
          400: '#f5af83',
          500: '#eb5e28', // Main brand color
          600: '#d44e1e',
          700: '#b83e14',
          800: '#9c2e0a',
          900: '#801e00',
        },
        // Background colors (using 'bg' prefix in class names like bg-bg-primary)
        // These use CSS variables that change based on theme
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-tertiary': 'var(--color-bg-tertiary)',
        'bg-elevated': 'var(--color-bg-elevated)',
        'bg-overlay': 'var(--color-bg-overlay)',
        // Also keep background for compatibility
        background: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
        },
        // Text colors (using 'text' prefix in class names like text-text-primary)
        // These use CSS variables that change based on theme
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        'text-quaternary': 'var(--color-text-quaternary)',
        'text-inverse': 'var(--color-text-inverse)',
        // Also keep text for compatibility
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          quaternary: 'var(--color-text-quaternary)',
          inverse: 'var(--color-text-inverse)',
        },
        // Border colors (using 'border' prefix in class names like border-border-primary)
        // These use CSS variables that change based on theme
        'border-primary': 'var(--color-border-primary)',
        'border-secondary': 'var(--color-border-secondary)',
        'border-focus': 'var(--color-border-focus)',
        // Also keep border for compatibility
        border: {
          primary: 'var(--color-border-primary)',
          secondary: 'var(--color-border-secondary)',
          focus: 'var(--color-border-focus)',
        },
        // Semantic colors (top-level for easy use in classes)
        success: '#4ade80',
        warning: '#fbbf24',
        danger: '#ef4444',
        info: '#3b82f6',
        // Semantic colors (nested for organization)
        semantic: {
          success: '#4ade80',
          'success-bg': 'rgba(74, 222, 128, 0.1)',
          warning: '#fbbf24',
          'warning-bg': 'rgba(251, 191, 36, 0.1)',
          danger: '#ef4444',
          'danger-bg': 'rgba(239, 68, 68, 0.1)',
          info: '#3b82f6',
          'info-bg': 'rgba(59, 130, 246, 0.1)',
        }
      },
      fontFamily: {
        'geomanist': ['Geomanist', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'caption': ['12px', { lineHeight: '1.4' }],
        'footnote': ['13px', { lineHeight: '1.4' }],
        'subheadline': ['15px', { lineHeight: '1.4' }],
        'callout': ['16px', { lineHeight: '1.4' }],
        'body': ['17px', { lineHeight: '1.6' }],
        'headline': ['17px', { lineHeight: '1.1' }],
        'title3': ['20px', { lineHeight: '1.1' }],
        'title2': ['22px', { lineHeight: '1.1' }],
        'title1': ['28px', { lineHeight: '1.1' }],
        'large-title': ['34px', { lineHeight: '1.1' }],
      },
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '3.5': '14px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
      },
      screens: {
        'xs': '480px',
        'sm': '768px',
        'md': '1024px',
        'lg': '1200px',
        'xl': '1370px',
      },
      boxShadow: {
        'hig': '0 4px 16px rgba(0, 0, 0, 0.3)',
        'hig-lg': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'hig-xl': '0 16px 64px rgba(0, 0, 0, 0.5)',
      },
      borderRadius: {
        'hig': '12px',
        'hig-lg': '16px',
      },
      zIndex: {
        'dropdown': 1000,
        'sticky': 1020,
        'fixed': 1030,
        'modal-backdrop': 1040,
        'modal': 1050,
        'popover': 1060,
        'tooltip': 1070,
        'toast': 1080,
      }
    },
  },
  plugins: [],
}

