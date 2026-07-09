/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#C98B2B',
          primaryDark: '#A66C19',
          secondary: '#F5F2ED',
          background: '#FAFAFA',
          surface: '#FFFFFF',
          text: '#1F2937',
          muted: '#6B7280',
          border: '#E7E2D9',
          success: '#0F8A5F',
          warning: '#C48310',
          danger: '#C0392B',
          info: '#2563EB',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(31, 41, 55, 0.08)',
        glow: '0 0 0 1px rgba(201, 139, 43, 0.18), 0 24px 50px rgba(201, 139, 43, 0.18)',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-radial':
          'radial-gradient(circle at top left, rgba(201, 139, 43, 0.15), transparent 30%), radial-gradient(circle at top right, rgba(245, 242, 237, 0.9), transparent 28%), linear-gradient(180deg, #FAFAFA 0%, #F7F4EE 100%)',
      },
    },
  },
  plugins: [],
};
