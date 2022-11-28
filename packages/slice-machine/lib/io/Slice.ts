import Files from "../utils/files";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { Slices, SliceSM } from "@slicemachine/core/build/models/Slice";
import path from "path";

export function readSlice(path: string): SliceSM {
  const slice: SharedSlice = Files.readJson(path);
  return Slices.toSM(slice);
}

export function writeSlice(path: string, slice: SliceSM) {
  Files.write(path, Slices.fromSM(slice));
}

export function renameSlice(path: string, newSliceName: string) {
  const slice = readSlice(path);
  slice.name = newSliceName;
  writeSlice(path, slice);
}

export function deleteSlice(src: string) {
  Files.hasWritePermissions(src);
  const files = Files.readDirectory(src);
  files.forEach((file) => Files.hasWritePermissions(path.join(src, file)));
  Files.removeDirectory(src);
}
