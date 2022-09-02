import Files from "../utils/files";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { Slices, SliceSM } from "@slicemachine/core/build/models/Slice";
import { generateTypes } from "prismic-ts-codegen";

export function readSlice(path: string): SliceSM {
  const slice: SharedSlice = Files.readJson(path);
  return Slices.toSM(slice);
}

export function writeSlice(path: string, slice: SliceSM) {
  Files.write(path, Slices.fromSM(slice));
}

export function writeSliceTypes(path: string, slice: SliceSM) {
  const content = generateTypes({ sharedSliceModels: [Slices.fromSM(slice)] });

  Files.write(path, content);
}

export function renameSlice(
  modelPath: string,
  typesPath: string,
  newSliceName: string
) {
  const slice = readSlice(modelPath);
  slice.name = newSliceName;
  writeSlice(modelPath, slice);
  writeSliceTypes(typesPath, slice);
}
