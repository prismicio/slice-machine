import Files from "@lib/utils/files";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { Slices, SliceSM } from "@slicemachine/core/build/models/Slice";

export function readSlice(path: string): SliceSM {
  const slice: SharedSlice = Files.readJson(path);
  return Slices.toSM(slice);
}

export function writeSlice(path: string, slice: SliceSM) {
  Files.write(path, Slices.fromSM(slice));
}
