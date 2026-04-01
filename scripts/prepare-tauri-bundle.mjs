import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const targetTriple = process.env.TAURI_ENV_TARGET_TRIPLE;

if (process.platform !== "darwin" || targetTriple !== "universal-apple-darwin") {
  process.exit(0);
}

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const tauriDir = path.join(repoRoot, "src-tauri");
const targetDir = path.join(tauriDir, "target");
const universalReleaseDir = path.join(
  targetDir,
  "universal-apple-darwin",
  "release",
);
const universalBinary = path.join(universalReleaseDir, "web_server");

function run(command, args) {
  console.log(`> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: process.env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

for (const archTarget of ["aarch64-apple-darwin", "x86_64-apple-darwin"]) {
  run("cargo", [
    "build",
    "--manifest-path",
    path.join(tauriDir, "Cargo.toml"),
    "--bin",
    "web_server",
    "--target",
    archTarget,
    "--release",
  ]);
}

mkdirSync(universalReleaseDir, { recursive: true });

run("lipo", [
  "-create",
  "-output",
  universalBinary,
  path.join(targetDir, "aarch64-apple-darwin", "release", "web_server"),
  path.join(targetDir, "x86_64-apple-darwin", "release", "web_server"),
]);
