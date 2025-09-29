import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
          // MAK-watches Professional Palette
          primary: {
            DEFAULT: '#1A1A1A', // Deep Black
            light: '#232323',
            dark: '#000000',
          },
          accent: {
            DEFAULT: '#C6A664', // Gold
            light: '#E6D3A3',
            dark: '#A68B44',
          },
          secondary: {
            DEFAULT: '#F5F5F5', // Off White
            light: '#FFFFFF',
            dark: '#E0E0E0',
          },
          info: '#3B82F6',
          success: '#22C55E',
          warning: '#F59E42',
          error: '#EF4444',
          // Neutral grays
          gray: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#E5E5E5',
            300: '#D4D4D4',
            400: '#A3A3A3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
          },
        },
       
        borderRadius: {
          xl: '1rem',
          '2xl': '1.5rem',
        },
        boxShadow: {
          gold: '0 4px 24px 0 rgba(198, 166, 100, 0.15)',
        },
      },
    },
      }


export default config
