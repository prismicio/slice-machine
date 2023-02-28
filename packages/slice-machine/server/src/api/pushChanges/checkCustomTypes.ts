import type { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import type { Component, Library } from "@slicemachine/core/build/models";

export function getCustomTypesWithInvalidReferences(
  localCustomTypes: CustomTypeSM[],
  localLibs: ReadonlyArray<Library<Component>>
): { id: string }[] {
  const localSliceIds = localLibs.flatMap((library) =>
    library.components.flatMap((localSlice) => localSlice.model.id)
  );

  return localCustomTypes
    .filter((ct) =>
      ct.tabs.some((tab) =>
        tab.sliceZone?.value.some(
          (z) =>
            !localSliceIds.includes(z.key) && z.value.type === "SharedSlice"
        )
      )
    )
    .map((ct) => ({
      id: ct.id,
    }));
}
