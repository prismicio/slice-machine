import type { Client } from "@slicemachine/client";
import * as Libraries from "@slicemachine/core/build/libraries";
import { Slices, type SliceSM } from "@slicemachine/core/build/models/Slice";
import {
  CustomTypes,
  type CustomTypeSM,
} from "@slicemachine/core/build/models/CustomType";
import { getLocalCustomTypes } from "../../../../lib/utils/customTypes";
import type {
  Component,
  Library,
  Manifest,
} from "@slicemachine/core/build/models";

/* -- FETCH LOCAL AND REMOTE MODELS -- */
export async function fetchModels(
  client: Client,
  cwd: string,
  libraries: NonNullable<Manifest["libraries"]>
): Promise<{
  localSlices: ReadonlyArray<Library<Component>>;
  remoteSlices: SliceSM[];
  localCustomTypes: CustomTypeSM[];
  remoteCustomTypes: CustomTypeSM[];
}> {
  /* -- Retrieve all the different models -- */
  const remoteCustomTypes: CustomTypeSM[] = await client
    .getCustomTypes()
    .then((customTypes) =>
      customTypes.map((customType) => CustomTypes.toSM(customType))
    );

  const remoteSlices: SliceSM[] = await client
    .getSlices()
    .then((slices) => slices.map((slice) => Slices.toSM(slice)));

  const localCustomTypes: CustomTypeSM[] = getLocalCustomTypes(cwd);

  const localSlices: ReadonlyArray<Library<Component>> = Libraries.libraries(
    cwd,
    libraries
  );

  return { localSlices, remoteSlices, localCustomTypes, remoteCustomTypes };
}
