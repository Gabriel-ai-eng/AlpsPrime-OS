/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-sans)'],
        display: ['var(--font-display)'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1.35rem',
        '3xl': '1.75rem',
        '4xl': '2.2rem',
      },
      colors: {
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input:  'hsl(var(--input))',
        ring:   'hsl(var(--ring))',
        gold: {
          light:   '#E8C77A',
          DEFAULT: '#C9A24F',
          dark:    '#A8852E',
        },
        lavender: {
          light:   '#D0DCFF',
          DEFAULT: '#8AA4FF',
          dark:    '#4060CC',
        },
        night: {
          50:  '#E8EAF4',
          100: '#C8CCDF',
          200: '#9099C0',
          300: '#5866A0',
          400: '#2E3A80',
          500: '#1A2260',
          600: '#141A4C',
          700: '#0E1238',
          800: '#090B26',
          900: '#050714',
          950: '#020310',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT:              'hsl(var(--sidebar-background))',
          foreground:           'hsl(var(--sidebar-foreground))',
          primary:              'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent:               'hsl(var(--sidebar-accent))',
          'accent-foreground':  'hsl(var(--sidebar-accent-foreground))',
          border:               'hsl(var(--sidebar-border))',
          ring:                 'hsl(var(--sidebar-ring))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'liquid-pulse': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%':      { opacity: '0.8', transform: 'scale(1.04)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(201,162,79,0.2)' },
          '50%':      { boxShadow: '0 0 22px rgba(201,162,79,0.45)' },
        },
        'atmo-drift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)',      opacity: '0.6' },
          '33%':      { transform: 'translate(12px, -8px) scale(1.04)', opacity: '0.8' },
          '66%':      { transform: 'translate(-8px, 6px) scale(0.97)', opacity: '0.5' },
        },
      },
      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        shimmer:           'shimmer 3s linear infinite',
        float:             'float 4s ease-in-out infinite',
        'liquid-pulse':    'liquid-pulse 3s ease-in-out infinite',
        'glow-pulse':      'glow-pulse 2.5s ease-in-out infinite',
        'atmo-drift':      'atmo-drift 14s ease-in-out infinite',
      },
      boxShadow: {
        glass:       '0 8px 40px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.05) inset',
        'glass-lg':  '0 16px 60px rgba(0,0,0,0.65), 0 1px 0 rgba(255,255,255,0.07) inset',
        gold:        '0 0 20px rgba(201,162,79,0.3), 0 4px 16px rgba(201,162,79,0.12)',
        'gold-sm':   '0 0 10px rgba(201,162,79,0.2)',
        blue:        '0 0 20px rgba(80,120,255,0.25), 0 4px 16px rgba(80,120,255,0.10)',
        'inner-top': 'inset 0 1px 0 rgba(255,255,255,0.08)',
        depth:       '0 20px 60px -10px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'gold-radial':  'radial-gradient(circle, rgba(201,162,79,0.2) 0%, transparent 70%)',
        'blue-radial':  'radial-gradient(circle, rgba(80,120,255,0.18) 0%, transparent 70%)',
        'glass-shine':  'linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)',
        'gold-gradient':'linear-gradient(135deg, #E8C77A 0%, #C9A24F 50%, #A8852E 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
