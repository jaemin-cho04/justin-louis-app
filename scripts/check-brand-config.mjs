import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const brandConfig = JSON.parse(readFileSync("src/config/brand.json", "utf8"));
const searchRoots = ["src", "README.md", "package.json", "app.config.js"];
const bannedTerms = [`Su${"mmit"}`, `su${"mmit"}`];
const failures = [];

if (brandConfig.appDisplayName !== "") {
  failures.push("src/config/brand.json: appDisplayName must stay blank until the final name is chosen.");
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
