import fs from "fs";
import path from "path";

import { SM_FILE } from "sm-commons/consts";
import { pascalize } from "sm-commons/utils/str";

import { getInfoFromPath as getLibraryInfo } from "../../helpers";
import { createDeclaration, createBody } from "./file";

async function handleLibraryPath(libPath) {
  const { isLocal, pathExists, pathToSlices } = await getLibraryInfo(libPath);

  if (!pathExists) {
    console.warn(
      `[next-slicezone] path to library "${pathToSlices}" does not exist. Skipping.`
    );
    return null;
  }

  const from = isLocal ? libPath.slice(2) : libPath;

  const endPathToSlices = `${isLocal ? "./" : ""}${from}${pathToSlices
    .split(from)
    .slice(1)
    .join("")}`;

  return {
    isLocal,
    from,
    name: pascalize(from),
    pathToSlices: endPathToSlices,
  };
}

export const createResolver = async () => {
  const pathToSmFile = path.posix.join(process.cwd(), SM_FILE);
  const { libraries } = fs.existsSync(pathToSmFile)
    ? JSON.parse(fs.readFileSync(pathToSmFile))
    : {};

  if (!libraries) {
    return console.warn(
      `[next-slicezone] expects a non-empty "libraries" array in file "${SM_FILE}"`
    );
  }

  if (!Array.isArray(libraries) || !libraries.length) {
    return console.error(
      '[next-slicezone] expects "libraries" option to be a non-empty array'
    );
  }

  const librariesInfo = await Promise.all(
    libraries.map(async (lib) => await handleLibraryPath(lib))
  );

  const declaration = createDeclaration(librariesInfo.filter((e) => e));
  const body = createBody();

  const file = `${declaration}
${body}
  `;
  return fs.writeFileSync(path.join(process.cwd(), "sm-resolver.js"), file);
};
