import { SliceModalValues } from "./formsTypes";
import { RESERVED_SLICE_NAME, API_ID_REGEX } from "@lib/consts";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { SliceSM } from "@lib/models/common/Slice";
import camelCase from "lodash/camelCase";
import startCase from "lodash/startCase";

type SliceModalValuesValidity =
  | {
      sliceName?: string;
    }
  | undefined;

export function validateSliceModalValues(
  { sliceName }: SliceModalValues,
  localLibs: ReadonlyArray<LibraryUI>,
  remoteLibs: ReadonlyArray<SliceSM>
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
    lib.components.map((slice) => slice.model.name)
  );
  const remoteNames = remoteLibs.map((slice) => slice.name);
  const usedNames = [...localNames, ...remoteNames];

  if (usedNames.includes(sliceName)) {
    return { sliceName: "Slice name is already taken." };
  }
}
