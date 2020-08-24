module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
  },
  purge: ['./components/**/*.tsx', './pages/**/*.tsx'],
  theme: {
    extend: {
      spacing: {
        '3/2': '0.375rem',
      },
      screens: {
        dark: { raw: '(prefers-color-scheme: dark)' },
      },
    },
  },
  variants: {
    textColor: ['responsive', 'hover', 'focus', 'active'],
    backgroundColor: ['responsive', 'hover', 'focus', 'active'],
    opacity: ['responsive', 'hover', 'active'],
  },
  plugins: [],
}
