import os from "os";
import { execSync } from "child_process";

export const getCodesmithCacheDir = () => {
  return `${os.tmpdir()}/csmith-generator/`;
};

export const clearCodesmithCache = () => {
  execSync(`rm -rf ${getCodesmithCacheDir()}/*`, {
    stdio: "inherit",
    stderr: "inherit",
  });
};
