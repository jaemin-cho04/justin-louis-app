import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const brandConfig = JSON.parse(readFileSync("src/config/brand.json", "utf8"));
const searchRoots = ["src", "README.md", "package.json", "app.config.js"];
const bannedTerms = [`Su${"mmit"}`, `su${"mmit"}`];
const failures = [];

for (const key of ["appDisplayName", "appSlug", "urlScheme", "iosBundleId", "androidPackage", "storageNamespace"]) {
  if (typeof brandConfig[key] !== "string" || !brandConfig[key].trim()) {
    failures.push(`src/config/brand.json: ${key} must be configured.`);
  }
}

if (!/^[a-z][a-z0-9-]*$/.test(brandConfig.appSlug)) failures.push("src/config/brand.json: appSlug must be store-safe lowercase text.");
if (!/^[a-z][a-z0-9+.-]*$/.test(brandConfig.urlScheme)) failures.push("src/config/brand.json: urlScheme must be a valid custom URL scheme.");
if (![brandConfig.iosBundleId, brandConfig.androidPackage].every((value) => /^(?:[A-Za-z][A-Za-z0-9_]*\.)+[A-Za-z][A-Za-z0-9_]*$/.test(value))) {
  failures.push("src/config/brand.json: native package identifiers must use reverse-domain notation.");
}

for (const file of searchRoots.flatMap((root) => listFiles(root))) {
  const content = readFileSync(file, "utf8");

  for (const term of bannedTerms) {
    if (content.includes(term)) {
      failures.push(`${file}: contains old placeholder term "${term}"`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

function listFiles(path) {
  const stat = statSync(path);

  if (!stat.isDirectory()) {
    return [path];
  }

  return readdirSync(path).flatMap((entry) => listFiles(join(path, entry)));
}
