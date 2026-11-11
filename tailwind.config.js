/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#041638',
          900: '#0a285f',
          850: '#0b3a82',
          800: '#0e4a9e',
          700: '#1257b8',
          600: '#1d6cdb',
          100: '#e1eaf8',
          50: '#f0f5fc',
        },
        brand: {
          blue: '#1668e3',
          darkBlue: '#0c3575',
          lightBlue: '#e8f0fe',
          yellow: '#f7b928',
          gold: '#f5a623',
          green: '#10b981',
          greenLight: '#e6f7ef',
          red: '#ef4444',
          redLight: '#fee2e2',
          bg: '#f0f4fb',
          surface: '#ffffff',
          border: '#dbe5f1',
          subtext: '#64748b',
          text: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'station-card': '0 2px 10px rgba(12, 40, 90, 0.06)',
        'station-hover': '0 4px 16px rgba(12, 40, 90, 0.12)',
        'station-header': '0 4px 20px rgba(4, 22, 56, 0.25)',
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};

