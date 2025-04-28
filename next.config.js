// next.config.js

const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable the new App Router (if you haven’t already)
  experimental: {
    esmExternals: "loose",
    appDir: true,
  },

  // Add your custom webpack config to resolve the "@" alias
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname),
    };
    return config;
  },
};

module.exports = nextConfig;
