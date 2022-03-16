import path from "path";
import * as t from "io-ts";
import {
  ComponentInfo,
  ComponentMetadata,
  Screenshot,
} from "../models/Library";

import { pascalize } from "../utils/str";

import { resolvePathsToScreenshot } from "./screenshot";
import Files from "../utils/files";
import { resolvePathsToMock } from "./mocks";
import { getOrElseW } from "fp-ts/lib/Either";
import { Slice, SliceAsObject } from "../models/Slice";
import { VariationAsObject, AsObject } from "../models/Variation";

import Errors from "../utils/errors";

function getMeta(model: SliceAsObject): ComponentMetadata {
  return {
    id: model.id,
    name: model.name,
    description: model.description,
  };
}

/** take a path to slice and return its name  */
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

function matchPossiblePaths(files: ReadonlyArray<string>): boolean {
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

function fromJsonFile<T>(
  pathToFile: string,
  validate: (payload: unknown) => Error | T
): T | Error | null {
  const fullPath = path.join(pathToFile);
  const hasFile = Files.exists(fullPath);

  if (hasFile) {
    return Files.readEntity(fullPath, validate);
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
  const match = matchPossiblePaths(files);

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
  assetsPaths: ReadonlyArray<string>,
  from: string
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

  const model = fromJsonFile(path.join(slicePath, "model.json"), (payload) =>
    getOrElseW((e: t.Errors) => new Error(Errors.report(e)))(
      Slice(AsObject).decode(payload)
    )
  );
  if (!model) {
    return;
  }
  if (model instanceof Error) {
    console.error(
      `Could not parse model ${path.basename(
        slicePath
      )}\nFull error: ${model.toString()}`
    );
    return;
  }

  const screenshotPaths = (model.variations || [])
    .map((v: VariationAsObject) => {
      const activeScreenshot = resolvePathsToScreenshot({
        paths: assetsPaths,
        from,
        sliceName,
        variationId: v.id,
      });
      return activeScreenshot && { [v.id]: activeScreenshot };
    })
    .reduce(
      (
        acc: { [variationId: string]: Screenshot },
        variationPreview: { [variationId: string]: Screenshot } | undefined
      ) => {
        return { ...acc, ...variationPreview };
      },
      {}
    );

  const nameConflict =
    sliceName !== pascalize(model.id) ? { sliceName, id: model.id } : null;

  /* This illustrates the requirement for apps to pass paths to mocks */
  const maybeMock = resolvePathsToMock({
    paths: assetsPaths,
    from,
    sliceName,
  });

  return {
    fileName,
    isDirectory,
    extension,
    model,
    meta: getMeta(model),
    mock: maybeMock?.value,
    nameConflict,
    screenshotPaths,
  };
}
