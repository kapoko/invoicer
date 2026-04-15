import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const execFileAsync = promisify(execFile);

const thisFilePath = fileURLToPath(import.meta.url);
const repoRoot = join(dirname(thisFilePath), "..");
const cliPath = join(repoRoot, "dist", "index.js");

const runCli = async (args = []) =>
  execFileAsync(process.execPath, [cliPath, ...args], { cwd: repoRoot });

test("CLI help displays usage and description", async () => {
  const { stdout } = await runCli(["--help"]);

  assert.match(stdout, /Usage: invoice/);
  assert.match(stdout, /Littlest invoice tool for the command line\./);
});

test("CLI version matches package.json", async () => {
  const packageJsonPath = join(repoRoot, "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));

  const { stdout } = await runCli(["--version"]);

  assert.equal(stdout.trim(), packageJson.version);
});
