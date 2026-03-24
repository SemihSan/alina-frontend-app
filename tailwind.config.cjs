
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // ✨ Premium Color Palette - Beauty Brand
      colors: {
        primary: {
          50:  '#FDF3F5',
          100: '#FAE8ED',
          200: '#F5D1DB',
          300: '#F0BAC9',
          400: '#EB9FB1',
          500: '#E87999',
          600: '#E25385',
          700: '#D83970',
          800: '#C9285C',
          900: '#B01A48',
        },
        secondary: {
          50:  '#FAFAF9',
          100: '#F5F5F3',
          200: '#EEEBE5',
          300: '#E8E5DD',
          400: '#DEDAD3',
          500: '#D4CFC5',
          600: '#CAC3B7',
          700: '#B8AFA1',
          800: '#8B8680',
          900: '#5F5A52',
        },
        accent: {
          50:  '#F8FAF7',
          100: '#F0F5F0',
          200: '#DFE8DC',
          300: '#C9D9C4',
          400: '#B3CAB0',
          500: '#9DBB9C',
          600: '#88A885',
          700: '#6B9570',
          800: '#50715A',
          900: '#354D42',
        },
        neutral: {
          50:  '#F9F9F7',
          100: '#F3F3F0',
          200: '#E5E5E0',
          300: '#D0D0C8',
          400: '#B8B8AD',
          500: '#9B9B91',
          600: '#828275',
          700: '#6B6B62',
          800: '#4A4A42',
          900: '#2D2D26',
        },
      },

      // ✨ Modern Typography
      fontFamily: {
        sans: [
          '"Inter"',
          '"Geist"',
          '"Segoe UI"',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        display: [
          '"Sora"',
          '"Poppins"',
          'system-ui',
          'sans-serif',
        ],
      },

      fontSize: {
        xs: ['12px', { lineHeight: '16px', letterSpacing: '0.5px' }],
        sm: ['14px', { lineHeight: '20px', letterSpacing: '0.25px' }],
        base: ['16px', { lineHeight: '24px', letterSpacing: '0px' }],
        lg: ['18px', { lineHeight: '28px', letterSpacing: '0px' }],
        xl: ['20px', { lineHeight: '32px', letterSpacing: '-0.5px' }],
        '2xl': ['24px', { lineHeight: '36px', letterSpacing: '-0.5px' }],
        '3xl': ['30px', { lineHeight: '40px', letterSpacing: '-0.75px' }],
        '4xl': ['36px', { lineHeight: '44px', letterSpacing: '-1px' }],
      },

      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },

      // ✨ Soft Shadows
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        sm: '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px 0 rgba(0, 0, 0, 0.08)',
        lg: '0 8px 12px 0 rgba(0, 0, 0, 0.10)',
        xl: '0 12px 16px 0 rgba(0, 0, 0, 0.10)',
        '2xl': '0 16px 24px 0 rgba(0, 0, 0, 0.12)',
        'sm-hover': '0 4px 8px 0 rgba(232, 121, 153, 0.12)',
      },

      // ✨ Soft Border Radius
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },

      // ✨ Transitions
      transitionDuration: {
        75: '75ms',
        100: '100ms',
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
      },

      // ✨ Animations
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        // PERDE EFEKTLERİ
        'slideOutLeft': {
          '0%': { 
            transform: 'translateX(0)',
            opacity: '1'
          },
          '70%': {
            transform: 'translateX(-100%)',
            opacity: '1'
          },
          '100%': { 
            transform: 'translateX(-100%)',
            opacity: '0',
            display: 'none'
          },
        },
        'slideOutRight': {
          '0%': { 
            transform: 'translateX(0)',
            opacity: '1'
          },
          '70%': {
            transform: 'translateX(100%)',
            opacity: '1'
          },
          '100%': { 
            transform: 'translateX(100%)',
            opacity: '0',
            display: 'none'
          },
        },
        'fadeOut': {
          '0%': { opacity: '1' },
          '70%': { opacity: '0.5' },
          '100%': { opacity: '0', display: 'none' },
        },
        'fadeIn': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },

      animation: {
        'fade-in': 'fade-in 300ms ease-in-out',
        'slide-down': 'slide-down 300ms ease-in-out',
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
