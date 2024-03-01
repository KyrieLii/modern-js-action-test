import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { clearCodesmithCache } from "./utils.mjs";

const __dirname = path.resolve();

const run = ({ rootDir, localScript, clearCache = false }) => {
  const testConfig = {
    noNeedInstall: true,
    actionType: "function",
    function: "ssg",
    packageManager: "pnpm",
    distTag: "",
  };

  const execa = (cmd) => {
    execSync(cmd, {
      cwd: rootDir,
      stdio: "inherit",
      stderr: "inherit",
    });
  };

  // resolutions version
  const jsonPath = path.join(rootDir, "package.json");
  const json = fs.readFileSync(jsonPath, "utf8");
  const pkg = JSON.parse(json);
  const version = process.env.MODERN_VERSION ?? "latest";

  if (clearCache) {
    clearCodesmithCache();
    execa(`npx --yes clear-npx-cache`);
  }

  if (!localScript) {
    pkg.resolutions = {
      "@modern-js/app-tools": version,
    };
    fs.writeFileSync(jsonPath, JSON.stringify(pkg, null, 2));
  }

  // install
  console.time("==== install timing ====");
  execa(`pnpm i --ignore-script`);
  console.timeEnd("==== install timing ====");

  // new action case
  const begin = Date.now();
  console.time("==== new timing ====");
  if (localScript) {
    const command = `${localScript} --solution=mwa --root-path=${rootDir} --config='${JSON.stringify(
      {
        debug: true,
        config: testConfig,
        cwd: rootDir,
        needInstall: false,
      }
    )}'`;
    console.log(command);
    execa(command);
  } else {
    execa(`pnpm run new --config=${JSON.stringify(testConfig)} --debug`);
  }
  const timing = Date.now() - begin;
  console.timeEnd("==== new timing ====");

  // reset
  execa(`git checkout -- ${rootDir}`);

  return timing;
};

const main = () => {
  let time = 3;
  const res = [];

  while (time > 0) {
    const timing = run({
      rootDir: path.join(__dirname, "../mwa"),
      version: "latest",
      clearCache: true,
    });
    res.push(timing);
    time--;
  }
  console.log(res);
};

main();
