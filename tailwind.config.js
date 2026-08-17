/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1220',
        inkSoft: '#131C2E',
        paper: '#F5F7FB',
        surface: '#FFFFFF',
        line: '#E4E8F0',
        teal: {
          DEFAULT: '#0FA6A6',
          dark: '#0B7F7F',
          light: '#E4F7F5'
        },
        amber: {
          DEFAULT: '#F5A524',
          light: '#FDF1DC'
        },
        coral: {
          DEFAULT: '#E8574A',
          light: '#FCE7E4'
        },
        slateink: '#64748B'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,18,32,0.04), 0 8px 24px -12px rgba(11,18,32,0.12)'
      }
    }
  },
  plugins: []
}
