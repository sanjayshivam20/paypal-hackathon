/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paypal: {
          blue: '#003087',
          light: '#0070E0',
          dark: '#001C64',
          success: '#00CF92',
          warning: '#FF9600',
          danger: '#FF4444',
          bg: '#0A0E1A',
          card: '#111827',
          surface: '#1F2937',
          border: '#374151'
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 112, 224, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 112, 224, 0.6)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      }
    }
  },
  plugins: []
}
