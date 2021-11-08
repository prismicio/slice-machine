import path from "path";
import { ComponentInfo, ComponentMetadata } from "../models/Library";

import { pascalize } from "../utils/str";

import { getPathToScreenshot } from "./screenshot";
import Files from "../utils/files";
import { sliceMocks } from "../mocks";

function getMeta(modelData: { id: string, description: string }): ComponentMetadata {
  return {
    id: modelData.id,
    description: modelData.description,
  };
}

/** take a path to slice and return its name  */
/* TODO: REFACTOR! so error prone to pop everywhere */
function getComponentName(slicePath: string): string | undefined {
  const split = slicePath.split(path.sep);
  const pop = split.pop();
  if (!pop) return;

  if (pop.indexOf("index.") === 0) {
    return split.pop();
  }
  if (pop.indexOf(split[split.length - 1]) === 0) {
    return slicePath.split(path.sep).pop();
  }
  return pop.split(".")[0];
}

/** naive method to find component file in a folder */
function findComponentFile(
  files: ReadonlyArray<string>,
  componentName: string
): string | undefined {
  const possiblePaths = ["index", componentName].reduce(
    (acc: string[], f: string) => [
      ...acc,
      `${f}.vue`,
      `${f}.js`,
      `${f}.jsx`,
      `${f}.ts`,
      `${f}.tsx`,
      `${f}.svelte`,
    ],
    []
  );
  return files.find((e) => possiblePaths.indexOf(e) > -1);
}

function matchPossiblePaths(
  files: ReadonlyArray<string>,
  _componentName: string
): boolean {
  const modelFilename = "model.json";

  return files.includes(modelFilename);
}

function splitExtension(str: string): {
  fileName: string | null;
  extension: string | null;
} {
  const fullName = str.split("/").pop();
  if (!fullName) {
    return {
      fileName: null,
      extension: null,
    };
  }

  const [fileName, extension] = fullName.split(".");
  return {
    fileName,
    extension,
  };
}

function fromJsonFile(
  slicePath: string,
  filePath: string
): any | null {
  const fullPath = path.join(slicePath, filePath);
  const hasFile = Files.exists(fullPath);

  if (hasFile) {
    const maybeData = Files.safeReadJson(fullPath);
    if (maybeData) {
      return maybeData;
    }
  }
  return null;
}

/** returns component file/directory info */
function getFileInfoFromPath(
  slicePath: string,
  componentName: string
): { fileName: string | null; extension: string | null; isDirectory: boolean } {
  const isDirectory = Files.isDirectory(slicePath);
  if (!isDirectory) {
    return { ...splitExtension(slicePath), isDirectory: false };
  }

  const files = Files.readDirectory(slicePath);
  const match = matchPossiblePaths(files, componentName);

  if (match) {
    const maybeFileComponent = findComponentFile(files, componentName);
    if (maybeFileComponent) {
      return { ...splitExtension(maybeFileComponent), isDirectory: true };
    }
    return { fileName: null, extension: null, isDirectory: true };
  }
  throw new Error(
    `[slice-machine] Could not find module file for component "${componentName}" at path "${slicePath}"`
  );
}

export function getComponentInfo(
  slicePath: string,
  { cwd, from }: { cwd: string; from: string }
): ComponentInfo | undefined {
  const sliceName = getComponentName(slicePath);

  if (!sliceName || !sliceName.length) {
    console.error(
      `[queries/component-info] Could not find slice name at path "${slicePath}". Skipping...`
    );
    return;
  }

  const fileInfo = (() => {
    try {
      return getFileInfoFromPath(slicePath, sliceName);
    } catch (e) {
      return null;
    }
  })();

  if (fileInfo === null) {
    return;
  }

  const { fileName, extension, isDirectory } = fileInfo;

  const model = fromJsonFile(slicePath, "model.json");
  if (!model) {
    return;
  }

  const previewUrls = (model.variations || [])
    .map((v: any) => {
      const activeScreenshot = getPathToScreenshot({ cwd, from, sliceName, variationId: v.id });

      return activeScreenshot && activeScreenshot.path
        ? {
            [v.id]: {
              hasPreview: !!activeScreenshot,
              isCustomPreview: activeScreenshot.isCustom,
              path: activeScreenshot.path,
            },
          }
        : undefined;
    })
    .reduce((acc: any, variationPreview: any) => {
      return { ...acc, ...variationPreview };
    }, {});

  const nameConflict =
    sliceName !== pascalize(model.id)
      ? { sliceName, id: model.id }
      : null;

  return {
    sliceName,
    fileName,
    isDirectory,
    extension,
    model,
    meta: getMeta(model),
    mock: sliceMocks(cwd, from, sliceName),
    nameConflict,
    previewUrls,
  };
}
