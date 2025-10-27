import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF5FF',
          100: '#D9E7FF',
          200: '#B5CEFF',
          300: '#8AAEFF',
          400: '#5F8CFF',
          500: '#3C6DFC',
          600: '#294CE0',
          700: '#1F38B4',
          800: '#192D8B',
          900: '#15256C',
        },
        neutral: {
          25: '#F7F8FB',
          50: '#F2F4F7',
          100: '#E4E7EC',
          200: '#D0D5DD',
          300: '#98A2B3',
          400: '#667085',
          500: '#475467',
          600: '#344054',
          700: '#1D2939',
          800: '#101828',
          900: '#0C111D',
        },
      },
      fontFamily: {
        display: ['System', 'ui-rounded'],
        sans: ['System'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
