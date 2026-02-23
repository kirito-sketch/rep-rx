/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     '#F8F6F2',   // warm chalk
          surface:  '#FFFFFF',   // white cards
          elevated: '#F0EDE6',   // warm elevated
        },
        border: {
          DEFAULT: '#E3DDD4',
          subtle:  '#EDE9E1',
        },
        accent: {
          DEFAULT: '#EA580C',   // strong orange
          dim:     '#FFF4EC',   // tinted bg
          text:    '#C2410C',   // darker for on-light
        },
        text: {
          primary:   '#1A1614',  // warm near-black
          secondary: '#625B54',  // warm mid-gray
          muted:     '#A59D95',  // warm light-gray
        },
        success: {
          DEFAULT: '#16A34A',
          dim:     '#DCFCE7',
          text:    '#15803D',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm:  '6px',
        md:  '12px',
        lg:  '18px',
        xl:  '24px',
      },
      boxShadow: {
        card:  '0 1px 4px 0 rgba(26,22,20,0.06), 0 4px 16px 0 rgba(26,22,20,0.06)',
        lift:  '0 4px 24px 0 rgba(26,22,20,0.10)',
        inner: 'inset 0 1px 3px rgba(26,22,20,0.08)',
      },
    },
  },
  plugins: [],
}
