/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f6f6f7',
          100: '#e2e2e5',
          200: '#c5c5cb',
          300: '#9d9da7',
          400: '#757582',
          500: '#5a5a66',
          600: '#464650',
          700: '#333339',
          800: '#1f1f24',
          900: '#121215',
          950: '#0a0a0c',
        },
        gold: {
          50: '#fbf8ef',
          100: '#f4ecd2',
          200: '#e8d6a3',
          300: '#dabd6e',
          400: '#cfa54a',
          500: '#c08d33',
          600: '#a36f29',
          700: '#845324',
          800: '#6d4324',
          900: '#5c3921',
        },
        blush: {
          50: '#fdf4f3',
          100: '#fbe6e4',
          200: '#f8d1cd',
          300: '#f1b0a9',
          400: '#e68276',
          500: '#d85c4c',
          600: '#c44231',
          700: '#a43526',
          800: '#882f23',
          900: '#722c23',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        shimmer: 'shimmer 2.2s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'fade-up': 'fade-up 0.7s ease-out both',
      },
      boxShadow: {
        soft: '0 18px 50px -20px rgba(18,18,21,0.28)',
        lift: '0 30px 70px -28px rgba(18,18,21,0.45)',
      },
    },
  },
  plugins: [],
}
