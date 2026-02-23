/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     '#020617',
          surface:  '#0f172a',
          elevated: '#1e293b',
        },
        border: {
          DEFAULT: '#1e293b',
          subtle:  '#0f172a',
        },
        accent: {
          DEFAULT: '#f97316',
          dim:     '#431407',
          text:    '#fdba74',
        },
        text: {
          primary:   '#f8fafc',
          secondary: '#94a3b8',
          muted:     '#475569',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
      },
    },
  },
  plugins: [],
}
