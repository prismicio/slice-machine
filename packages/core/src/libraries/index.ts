import fs from "fs";
import path from "path";
import * as t from "io-ts";
import { getOrElseW } from "fp-ts/lib/Either";

import { Files } from "../node-utils";
import { getInfoFromPath } from "./path";
import { getComponentInfo } from "./component";
import { Library, Component } from "../models/Library";

export * from "./component";
export * from "./screenshot";
export * from "./path";
export * from "./mocks";

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
      const componentInfo = getComponentInfo(
        curr,
        [cwd, path.join(cwd, ".slicemachine", "assets")],
        from
      );
      if (!componentInfo) {
        return acc;
      }
      return [
        ...acc,
        {
          from,
          href: from.replace(/\//g, "--"),
          pathToSlice,
          fileName: componentInfo.fileName,
          extension: componentInfo.extension,
          screenshots: componentInfo.screenshots,
          mock: componentInfo.mock,
          model: componentInfo.model,
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

export const LibraryMeta = {
  reader: t.exact(
    t.partial({
      name: t.string,
      version: t.string,
    })
  ),
  build(libPath: string): t.TypeOf<typeof this.reader> | undefined {
    const meta = Files.safeReadEntity(
      path.join(libPath, "meta.json"),
      (payload) => {
        return getOrElseW(() => null)(LibraryMeta.reader.decode(payload));
      }
    );
    if (!meta) return;

    return {
      name: meta.name,
      version: meta.version,
    };
  },
};

export type LibraryMeta = t.TypeOf<typeof LibraryMeta.reader>;
