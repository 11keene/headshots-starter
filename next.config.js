// next.config.js
const path = require("path");

/** @type {import('next').NextConfig} */
module.exports = {
  // Internationalization settings
  i18n: {
    locales: ["en", "de", "fr", "pt", "es"],
    defaultLocale: "en",
    localeDetection: false,
  },

  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname),
    };
    return config;
  },
};
