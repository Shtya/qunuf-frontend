// tailwind.config.js
/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
			keyframes: {
        "infinite-scroll": {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "infinite-scroll": "infinite-scroll 25s linear infinite",
      },
      colors: {
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        secondary: 'var(--secondary)',
        'secondary-hover': 'var(--secondary-hover)',
        lightGold: 'var(--lightGold)',
        light: 'var(--light)',
        lighter: 'var(--lighter)',
        highlight: 'var(--highlight)',
        gray: 'var(--gray)',
        'grey-dark': 'var(--grey-dark)',
        dark: 'var(--dark)',
        input: 'var(--input)',
        placeholder: 'var(--placeholder)',
        noti: 'var(--noti)',
        orange: 'var(--orange)',
        'dashboard-bg': 'var(--dashboard-bg)',
        'card-bg': 'var(--card-bg)',
        sidebar: 'var(--sidebar)',
        'sidebar-foreground': 'var(--sidebar-foreground)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
      backgroundColor: {
        card: 'var(--card-bg)',
        dashboard: 'var(--dashboard-bg)',
      },
      textColor: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        lighter: 'var(--lighter)',
        dark: 'var(--dark)',
        highlight: 'var(--highlight)',
      },
    },
    fontFamily: {
      sans: ['Inter', ...fontFamily.sans],
    },
  },
  plugins: [],
};
