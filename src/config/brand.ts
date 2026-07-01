import rawBrandConfig from "./brand.json";

export const brandConfig = rawBrandConfig;

export function getDisplayName(): string {
  const name = brandConfig.appDisplayName.trim();
  return name || brandConfig.fallbackDisplayName;
}

export function getBrandKicker(): string {
  const name = brandConfig.appDisplayName.trim();
  return name ? name.toUpperCase() : brandConfig.brandKicker;
}
