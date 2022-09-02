import glob from "glob";

import { getFormattedLibIdentifier } from "@slicemachine/core/build/libraries";
import { SliceSM } from "@slicemachine/core/build/models/Slice";

import Files from "./files";
import { CustomPaths } from "../models/paths";
import * as IO from "../io";

export function getLocalSlices(
  cwd: string,
  libraries: string[] = []
): SliceSM[] {
  const slices: SliceSM[] = [];
  for (const library of libraries) {
    const pathToSlices = CustomPaths(cwd)
      .library(getFormattedLibIdentifier(library).from)
      .value();

    const folderExists = Files.exists(pathToSlices);
    if (!folderExists) continue;

    const matches = glob.sync(`${pathToSlices}/**/model.json`);

    slices.push(
      ...matches.reduce((acc: Array<SliceSM>, p: string) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const smModel = IO.Slice.readSlice(p);
          return [...acc, smModel];
        } catch (e) {
          return acc;
        }
      }, [])
    );
  }

  return slices;
}
