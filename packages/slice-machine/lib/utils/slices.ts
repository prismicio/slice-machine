import glob from "glob";

import { getFormattedLibIdentifier } from "@prismic-beta/slicemachine-core/build/libraries";
import { SliceSM } from "@prismic-beta/slicemachine-core/build/models/Slice";

import Files from "./files";
import { CustomPaths } from "../models/paths";
import * as IO from "../io";

// Loads all Slice models from all libraries.
export function getLocalSlices(
  cwd: string,
  libraries: string[] = []
): SliceSM[] {
  return libraries.flatMap((library) => {
    const pathToSlices = CustomPaths(cwd)
      .library(getFormattedLibIdentifier(library).from)
      .value();

    const folderExists = Files.exists(pathToSlices);
    if (!folderExists) return [];

    const modelFilePaths = glob.sync(`${pathToSlices}/**/model.json`);

    return modelFilePaths
      .map((modelFilePath) => {
        try {
          return IO.Slice.readSlice(modelFilePath);
        } catch {
          return undefined;
        }
      })
      .filter((model): model is NonNullable<typeof model> => Boolean(model));
  });
}
