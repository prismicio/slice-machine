// @ts-ignore
import { pascalize } from "../../utils/str";
import { compareVariations } from "../../utils";

import Slice from "./Slice";
import { AsObject } from "./Variation";
import { Component, ComponentInfo } from "./Component";

export enum LibStatus {
  Modified = "MODIFIED",
  Synced = "SYNCED",
  PreviewMissing = "PREVIEW_MISSING",
  Invalid = "INVALID",
  NewSlice = "NEW_SLICE",
}

export interface Library {
  name: string;
  isLocal: boolean;
  components: ReadonlyArray<ComponentWithLibStatus>;
}

export const Library = {
  withStatus: function (
    lib: Library,
    remoteSlices: ReadonlyArray<Slice<AsObject>>
  ): Library {
    const components = lib.components.map((component: Component) => {
      const sliceFound = remoteSlices.find(
        (slice) => component.model.id === slice.id
      );
      const __status = (() => {
        const hasPreviewsMissing = ComponentInfo.hasPreviewsMissing(
          component.infos
        );
        if (hasPreviewsMissing) {
          return LibStatus.PreviewMissing;
        }
        // try {
        //   sliceSchema.validateSync(component)
        // } catch (e) { LibStatus.Invalid }

        if (!sliceFound) {
          return LibStatus.NewSlice;
        }
        return !compareVariations(
          component.model.variations,
          sliceFound.variations
        )
          ? LibStatus.Modified
          : LibStatus.Synced;
      })();

      return {
        ...component,
        __status,
      };
    });

    return {
      name: lib.name,
      isLocal: lib.isLocal,
      components,
    };
  },
};

export type ComponentWithLibStatus = Component & ({ __status: LibStatus } | {});
