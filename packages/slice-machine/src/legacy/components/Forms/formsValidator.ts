import camelCase from "lodash/camelCase";
import startCase from "lodash/startCase";

import { API_ID_REGEX, RESERVED_SLICE_NAME } from "@/legacy/lib/consts";
import { LibraryUI } from "@/legacy/lib/models/common/LibraryUI";
import { SliceSM } from "@/legacy/lib/models/common/Slice";

import { SliceModalValues } from "./formsTypes";

type SliceModalValuesValidity =
  | {
      sliceName?: string;
    }
  | undefined;

export function validateSliceModalValues(
  { sliceName }: SliceModalValues,
  localLibs: ReadonlyArray<LibraryUI>,
  remoteLibs: ReadonlyArray<SliceSM>,
): SliceModalValuesValidity {
  if (!sliceName) {
    return { sliceName: "Cannot be empty" };
  }
  if (!API_ID_REGEX.exec(sliceName)) {
    return { sliceName: "No special characters allowed" };
  }
  const cased = startCase(camelCase(sliceName)).replace(/\s/gm, "");
  if (cased !== sliceName.trim()) {
    return { sliceName: "Value has to be PascalCased" };
  }
  // See: #599
  if (sliceName.match(/^\d/)) {
    return { sliceName: "Value cannot start with a number" };
  }
  if (RESERVED_SLICE_NAME.includes(sliceName)) {
    return {
      sliceName: `${sliceName} is reserved for Slice Machine use`,
    };
  }

  const localNames = localLibs.flatMap((lib) =>
    lib.components.map((slice) => slice.model.name),
  );
  const remoteNames = remoteLibs.map((slice) => slice.name);
  const usedNames = [...localNames, ...remoteNames];

  if (usedNames.includes(sliceName)) {
    return { sliceName: "Slice name is already taken." };
  }
}
