import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["src", "scripts"];
const hardLimit = 700;
const softLimit = 500;
const extensions = new Set([".ts", ".tsx", ".js", ".mjs", ".json"]);

const failures = [];
const warnings = [];

for (const file of roots.flatMap((root) => listFiles(root))) {
  if (![...extensions].some((extension) => file.endsWith(extension))) {
    continue;
  }

  const lines = readFileSync(file, "utf8").split("\n").length;

  if (lines > hardLimit) {
    failures.push(`${file}: ${lines} lines`);
  } else if (lines > softLimit) {
    warnings.push(`${file}: ${lines} lines`);
  }
}

for (const warning of warnings) {
  console.warn(`Near file-size target: ${warning}`);
}

if (failures.length > 0) {
  console.error(`Files over ${hardLimit} lines:\n${failures.join("\n")}`);
  process.exit(1);
}

function listFiles(root) {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    const stat = statSync(path);
    return stat.isDirectory() ? listFiles(path) : path;
  });
}
