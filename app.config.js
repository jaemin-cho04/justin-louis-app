const brandConfig = require("./src/config/brand.json");

const displayName = brandConfig.appDisplayName || brandConfig.fallbackDisplayName;

module.exports = {
  expo: {
    name: displayName,
    slug: brandConfig.appSlug,
    version: "0.1.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    scheme: brandConfig.urlScheme,
    ios: {
      supportsTablet: true,
      bundleIdentifier: brandConfig.iosBundleId
    },
    android: {
      package: brandConfig.androidPackage
    },
    plugins: []
  }
};
