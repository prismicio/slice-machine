import {
  type SliceInsertChange,
  type SliceUpdateChange,
  type SliceDeleteChange,
  ChangeTypes,
} from "@slicemachine/client";
import { Slices, type SliceSM } from "@slicemachine/core/build/models/Slice";
import {
  ModelStatus,
  computeModelStatus,
} from "../../../../lib/models/common/ModelStatus";
import type { Component, Library } from "@slicemachine/core/build/models";
import { LocalOrRemoteSlice } from "../../../../lib/models/common/ModelData";
import { normalizeFrontendSlices } from "../../../../lib/models/common/normalizers/slices";
import { BackendEnvironment } from "../../../../lib/models/common/Environment";
import { purge } from "../services/uploadScreenshotClient";
import { compareScreenshots } from "../../../../lib/models/common/ModelStatus/compareSliceModels";
import { updateModelWithScreenshots } from "./updateModelWithScreenshots";

export async function buildSliceChanges(
  env: BackendEnvironment,
  localSlices: ReadonlyArray<Library<Component>>,
  remoteSlices: SliceSM[]
): Promise<(SliceInsertChange | SliceUpdateChange | SliceDeleteChange)[]> {
  const slicesModels: LocalOrRemoteSlice[] = normalizeFrontendSlices(
    localSlices,
    remoteSlices
  );

  const sliceChangesUnfiltered = await Promise.all(
    slicesModels.map(async (slice) => {
      // assessing the user is connected if we went that far in the processing
      const statusResult = computeModelStatus(slice, true);

      switch (statusResult.status) {
        case ModelStatus.New: {
          const modelWithScreenshots = await updateModelWithScreenshots(
            env,
            statusResult.model.local,
            localSlices
          );
          const payload = Slices.fromSM(modelWithScreenshots);
          return {
            type: ChangeTypes.SLICE_INSERT,
            id: payload.id,
            payload,
          };
        }
        case ModelStatus.Deleted: {
          const { err: purgeError } = await purge(
            env,
            statusResult.model.remote.id
          );
          if (purgeError) throw purgeError;
          return {
            type: ChangeTypes.SLICE_DELETE,
            id: statusResult.model.remote.id,
            payload: { id: statusResult.model.remote.id },
          };
        }
        case ModelStatus.Modified: {
          let sliceModel: SliceSM = statusResult.model.local;
          if (
            !compareScreenshots(
              statusResult.model.remote,
              statusResult.model.localScreenshots
            )
          ) {
            const { err: purgeError } = await purge(
              env,
              statusResult.model.remote.id
            );
            if (purgeError) throw purgeError;
            sliceModel = await updateModelWithScreenshots(
              env,
              statusResult.model.local,
              localSlices
            );
          } else {
            sliceModel = {
              ...sliceModel,
              variations: sliceModel.variations.map((localVariation) => ({
                ...localVariation,
                imageUrl: statusResult.model.remote.variations.find(
                  (remoteVariation) => remoteVariation.id === localVariation.id
                )?.imageUrl,
              })),
            };
          }
          const payload = Slices.fromSM(sliceModel);
          return {
            type: ChangeTypes.SLICE_UPDATE,
            id: payload.id,
            payload,
          };
        }
        default:
          return undefined;
      }
    })
  );

  return sliceChangesUnfiltered.filter(
    (
      change
    ): change is SliceInsertChange | SliceUpdateChange | SliceDeleteChange =>
      change !== undefined
  );
}
