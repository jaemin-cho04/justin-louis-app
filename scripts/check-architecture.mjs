import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, normalize, resolve } from "node:path";

const sourceRoot = resolve("src");
const failures = [];
const allowedExceptions = new Set([
  // The top-level error boundary reports incidents without exposing monitoring to feature UI.
  normalize("src/shared/components/AppErrorBoundary.tsx->src/services/monitoring/monitoring")
]);

for (const file of listFiles(sourceRoot).filter((path) => /\.tsx?$/.test(path))) {
  const source = readFileSync(file, "utf8");
  const fromLayer = layerFor(file);

  for (const specifier of importSpecifiers(source)) {
    if (!specifier.startsWith(".")) {
      if (fromLayer === "domain" && /^(react-native|expo|@supabase)/.test(specifier)) {
        failures.push(`${relative(file)}: domain code cannot import platform package '${specifier}'`);
      }
      continue;
    }

    const target = resolveImport(dirname(file), specifier);
    const toLayer = layerFor(target);
    const edge = normalize(`${relative(file)}->${relative(target)}`);
    if (allowedExceptions.has(edge)) continue;

    if (fromLayer === "domain" && ["features", "services"].includes(toLayer)) {
      failures.push(`${relative(file)}: domain cannot depend on ${toLayer} (${specifier})`);
    }
    if (fromLayer === "shared" && toLayer === "features") {
      failures.push(`${relative(file)}: shared code cannot depend on a feature (${specifier})`);
    }
    if (fromLayer === "services" && toLayer === "features") {
      failures.push(`${relative(file)}: services cannot depend on presentation features (${specifier})`);
    }
    if (fromLayer === "features" && /\/services\/(storage|remote|media|privacy|monitoring|notifications)\//.test(target)) {
      failures.push(`${relative(file)}: feature UI must receive infrastructure capabilities through props (${specifier})`);
    }
  }
}

if (failures.length) {
  console.error(`Architecture boundary violations:\n${failures.join("\n")}`);
  process.exit(1);
}

console.log("Architecture dependency checks passed.");

function importSpecifiers(source) {
  const values = [];
  for (const match of source.matchAll(/(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g)) values.push(match[1]);
  return values;
}

function resolveImport(directory, specifier) {
  return normalize(resolve(directory, specifier).replace(/\.(tsx?|jsx?)$/, ""));
}

function layerFor(path) {
  const match = normalize(path).match(/\/src\/(config|domain|features|services|shared|shell)(?:\/|$)/);
  return match?.[1] ?? "unknown";
}

function relative(path) {
  return normalize(path).replace(sourceRoot + "/", "src/").replace(/\.(tsx?|jsx?)$/, "");
}

function listFiles(root) {
  return readdirSync(root).flatMap((entry) => {
    const path = resolve(root, entry);
    return statSync(path).isDirectory() ? listFiles(path) : path;
  });
}
