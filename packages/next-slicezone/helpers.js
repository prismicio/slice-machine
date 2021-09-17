import fs from "fs";
import path from "path";
import slash from "slash";

import { SM_CONFIG_FILE } from "sm-commons/consts";

export function splitExtension(str) {
  const fullName = str.split(path.sep).pop();
  const [fileName, extension] = fullName.split(".");
  return {
    fileName,
    extension,
  };
}

export function getComponentName(slicePath) {
  const split = slicePath.split(path.sep);
  const pop = split.pop();
  if (pop.indexOf("index.") === 0) {
    return split.pop();
  }
  if (pop.indexOf(split[split.length - 1]) === 0) {
    return slicePath.pop();
  }
  return pop.split(".")[0];
}

/** from relative path */
export function getInfoFromPath(libPath, startPath) {
  const isLocal =
    ["@/", "~", "/"].find((e) => libPath.indexOf(e) === 0) !== undefined;
  const pathToLib = path.join(
    startPath || process.cwd(),
    isLocal ? "" : "node_modules",
    isLocal ? libPath.substring(1, libPath.length) : libPath
  );
  const pathToConfig = path.join(pathToLib, SM_CONFIG_FILE);
  const pathExists = fs.existsSync(pathToLib);

  let config = {};
  if (fs.existsSync(pathToConfig)) {
    config = JSON.parse(fs.readFileSync(pathToConfig));
  }
  const pathToSlices = path.join(
    pathToLib,
    config.pathToLibrary || ".",
    config.slicesFolder || (isLocal ? "." : "slices")
  );

  return {
    config,
    isLocal,
    pathExists,
    pathToLib: slash(pathToLib),
    pathToSlices: slash(pathToSlices),
  };
}
