/* eslint-disable */
import path from "path";
import { CustomPaths, PackagePaths, GeneratedPaths } from "../models/paths";
import Files from "../utils/files";

const { acceptedImagesTypes } = require("../consts");

export function getExternalPathToScreenshot({
  cwd,
  from,
  sliceName,
}: {
  cwd: string;
  from: string;
  sliceName: string;
}): { exists: boolean; path: string; isCustom: boolean } | undefined {
  // this should be parsed from sm.config
  const smPathToLibrary = "src";

  const p = PackagePaths(cwd)
    .library(path.join(from, smPathToLibrary, "slices"))
    .slice(sliceName)
    .preview();

  return {
    path: p,
    exists: Files.exists(p),
    isCustom: true,
  };
}

export function getPathToScreenshot({
  cwd,
  from,
  sliceName,
  variationId,
}: {
  cwd: string;
  from: string;
  sliceName: string;
  variationId: string;
}): { exists: boolean; path: string; isCustom: boolean } | undefined {
  const customPaths = acceptedImagesTypes.map((imageType: string) => {
    const previewPath = CustomPaths(cwd)
      .library(from)
      .slice(sliceName)
      .variation(variationId)
      .preview(`preview.${imageType}`);

    return {
      path: previewPath,
      options: {
        exists: true,
        isCustom: true,
      },
    };
  });

  const defaultPath = {
    path: GeneratedPaths(cwd)
      .library(from)
      .slice(sliceName)
      .variation(variationId)
      .preview(),
    options: {
      exists: true,
      isCustom: false,
    },
  };

  return Files.readFirstOf<string, { exists: boolean; isCustom: boolean }>(
    customPaths.concat([defaultPath])
  )((v: string) => v);
}
