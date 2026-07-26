const brandConfig = require("./src/config/brand.json");

const displayName = brandConfig.appDisplayName || brandConfig.fallbackDisplayName;
const easProjectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
const sentryBuildConfigured = Boolean(process.env.SENTRY_ORG && process.env.SENTRY_PROJECT);

module.exports = {
  expo: {
    name: displayName,
    slug: brandConfig.appSlug,
    version: "0.1.0",
    runtimeVersion: { policy: "appVersion" },
    icon: "./assets/icon.png",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    scheme: brandConfig.urlScheme,
    ios: {
      icon: "./assets/icon.png",
      supportsTablet: true,
      bundleIdentifier: brandConfig.iosBundleId,
      buildNumber: "1",
      config: { usesNonExemptEncryption: false }
    },
    android: {
      package: brandConfig.androidPackage,
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0A0A0C"
      },
      blockedPermissions: ["android.permission.RECORD_AUDIO"]
    },
    web: {
      favicon: "./assets/icon.png"
    },
    extra: easProjectId ? { eas: { projectId: easProjectId } } : {},
    updates: easProjectId ? { url: `https://u.expo.dev/${easProjectId}` } : undefined,
    plugins: [
      "expo-font",
      "expo-notifications",
      "expo-secure-store",
      [
        "expo-splash-screen",
        {
          image: "./assets/splash-icon.png",
          imageWidth: 180,
          resizeMode: "contain",
          backgroundColor: "#0A0A0C"
        }
      ],
      ...(sentryBuildConfigured ? ["@sentry/react-native/expo"] : []),
      [
        "expo-image-picker",
        {
          photosPermission: "Progress uses your photo library only when you choose a profile photo."
        }
      ]
    ]
  }
};
