// postcss.config.js
module.exports = {
  plugins: {
    // Use the new package instead of the old tailwindcss plugin:
    '@tailwindcss/postcss': {},
    // Keep autoprefixer as-is:
    autoprefixer: {},
  },
}
