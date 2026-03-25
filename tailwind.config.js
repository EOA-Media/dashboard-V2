/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        eoa: {
          bg: '#07091A',
          surface: '#0B0F20',
          card: '#0F1528',
          border: '#1C2845',
          'border-light': '#263554',
          blue: '#60A5FA',
          'blue-dim': '#3B82F6',
          'blue-deep': '#1D4ED8',
          purple: '#A78BFA',
          'purple-dim': '#7C3AED',
          amber: '#FBBF24',
          red: '#F87171',
          green: '#4ADE80',
          'green-dim': '#22C55E',
          'text-primary': '#EFF2FB',
          'text-secondary': '#5E7098',
          'text-muted': '#2E3F60',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, rgba(59,130,246,0.14) 0%, rgba(124,58,237,0.14) 100%)',
        'gradient-brand-border': 'linear-gradient(135deg, rgba(96,165,250,0.45) 0%, rgba(167,139,250,0.45) 100%)',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(59,130,246,0.18), 0 0 40px rgba(59,130,246,0.06)',
        'glow-purple': '0 0 20px rgba(124,58,237,0.18), 0 0 40px rgba(124,58,237,0.06)',
        'glow-brand': '0 0 24px rgba(80,100,246,0.15), 0 0 48px rgba(124,58,237,0.08)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
