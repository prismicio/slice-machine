import fs from "fs";
import path from "path";

import Files from "../utils/files";
import { getInfoFromPath } from "../utils/lib";
import { getComponentInfo } from "./component";
import { Library, Component, LibraryMeta } from "../models/Library";

export function handleLibraryPath(
  cwd: string,
  libPath: string
): Library<Component> | undefined {
  const { from, isLocal, pathExists, pathToSlices, pathToLib } =
    getInfoFromPath(cwd, libPath);

  if (!pathExists) {
    return;
  }

  // all paths to components found in slices folder
  const pathsToComponents = Files.readDirectory(
    pathToSlices.split(path.sep).join(path.posix.sep)
  )
    .map((curr) => path.join(pathToSlices, curr))
    .filter((e) => {
      const f = e.split(path.sep).pop();
      return fs.lstatSync(e).isDirectory() && !f?.startsWith(".");
    });

  // relative path to slice folder, to be appended with sliceName
  const pathToSlice = `${isLocal ? "./" : ""}${from}${pathToSlices
    .split(from)
    .slice(1)
    .join("")}`;

  const allComponents: Component[] = pathsToComponents.reduce(
    (acc: Component[], curr: string) => {
      const componentInfo = getComponentInfo(curr, { cwd, from });
      if (!componentInfo) {
        return acc;
      }
      const { model } = componentInfo;
      return [
        ...acc,
        {
          from,
          href: from.replace(/\//g, "--"),
          pathToSlice,
          infos: componentInfo,
          model,
          migrated: false,
        },
      ];
    },
    []
  );

  const meta = LibraryMeta.build(pathToLib);

  return {
    path: pathToLib,
    isLocal,
    name: from,
    components: allComponents,
    meta,
  };
}

export function libraries(
  cwd: string,
  libraries: ReadonlyArray<string>
): ReadonlyArray<Library<Component>> {
  return (libraries || [])
    .map((lib) => handleLibraryPath(cwd, lib))
    .filter(Boolean) as ReadonlyArray<Library<Component>>;
}

export * from "./screenshot";
