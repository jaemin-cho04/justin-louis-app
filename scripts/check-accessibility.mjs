import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const failures = [];
for (const file of listFiles("src").filter((path) => path.endsWith(".tsx"))) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/<Pressable\b[\s\S]*?(?<![=])>(?!=)/g)) {
    if (!match[0].includes("accessibilityRole=")) failures.push(`${file}: Pressable is missing accessibilityRole`);
    if (!match[0].includes("onPress=")) failures.push(`${file}: Pressable is missing an action`);
  }
  for (const match of source.matchAll(/<TextInput\b[\s\S]*?\/>/g)) {
    if (!/accessibilityLabel=|placeholder=/.test(match[0])) failures.push(`${file}: TextInput needs a label or placeholder`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Accessibility source checks passed.");

function listFiles(root) {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    return statSync(path).isDirectory() ? listFiles(path) : path;
  });
}
