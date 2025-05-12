import plugin from 'tailwindcss/plugin';
import { addIconSelectors } from '@iconify/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '390px',
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        xxs: ['0.5rem', { lineHeight: '0.625rem' }],
      },

      colors: {
        // Redesign
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cad5e2',
          400: '#90a1b9',
          500: '#67778e',
          600: '#495668',
          700: '#314158',
          750: '#253446',
          800: '#212a36',
          850: '#19242e',
          900: '#151e28',
          925: '#111922',
          950: '#0b0e13',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c6',
          200: '#fee685',
          300: '#ffd230',
          400: '#ffb900',
          DEFAULT: '#ffb900',
          500: '#fe9a00',
          600: '#e17100',
          700: '#bb4d00',
          800: '#973c00',
          900: '#7b3306',
          950: '#461901',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d0fae5',
          200: '#a4f4cf',
          300: '#5ee9b5',
          400: '#3ce3ab',
          DEFAULT: '#3ce3ab',
          500: '#02c78c',
          600: '#00a272',
          700: '#00815f',
          800: '#00664c',
          900: '#005440',
          950: '#002f25',
        },
        rose: {
          50: '#fff1f4',
          100: '#ffe4ea',
          200: '#fecddb',
          300: '#fca5bd',
          400: '#f23674',
          DEFAULT: '#f23674',
          500: '#eb2d6f',
          600: '#e01e68',
          700: '#bd1358',
          800: '#9e134f',
          900: '#871449',
          950: '#4b0624',
        },
        primary: {
          DEFAULT: '#c7f284',
          200: '#c7f284',
          300: '#a1c56e',
          400: '#698453',
          500: '#415337',
          600: '#2e3c2c',
          700: '#1b2621',
          800: '#151f20',
          900: '#121a1c',
          950: '#0c1418',
        },
      },
    },
  },
  plugins: [
    // Iconify plugin for clean selectors, requires writing a list of icon sets to load
    // Icons usage in HTML:
    //  <span class="iconify [icon-set]--[icon]"></span>
    //  <span class="iconify ph--airplane-tilt-fill"></span>
    addIconSelectors({
      // List of icon sets
      prefixes: ['ph'],
    }),
  ],
};
