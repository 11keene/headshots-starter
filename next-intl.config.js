// next-intl.config.js
/** @type {import('next-intl').I18nConfig} */
module.exports = {
  // exactly the same list you have in your messages/ folder
  locales: ["en", "es", "fr", "de", "pt", "ja", "ru", "zh-CN"],
  defaultLocale: "en",
  // you can leave out `pages` for App Router—namespaces aren’t needed here
};
