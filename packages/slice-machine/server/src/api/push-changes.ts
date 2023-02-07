import {
  type SliceInsertChange,
  type SliceUpdateChange,
  type Limit,
  type SliceDeleteChange,
  type CustomTypeInsertChange,
  type CustomTypeUpdateChange,
  type CustomTypeDeleteChange,
  type BulkBody,
  type ClientError,
  ChangeTypes,
} from "@slicemachine/client";
import * as Libraries from "@slicemachine/core/build/libraries";
import { Slices, type SliceSM } from "@slicemachine/core/build/models/Slice";
import {
  CustomTypes,
  type CustomTypeSM,
} from "@slicemachine/core/build/models/CustomType";
import { getLocalCustomTypes } from "../../../lib/utils/customTypes";
import {
  ModelStatus,
  computeModelStatus,
} from "../../../lib/models/common/ModelStatus";
import { onError } from "../../../lib/models/server/ApiResult";
import type { ApiResult } from "../../../lib/models/server/ApiResult";
import type { Component, Library } from "@slicemachine/core/build/models";
import {
  getModelId,
  LocalOrRemoteCustomType,
  LocalOrRemoteSlice,
} from "../../../lib/models/common/ModelData";

import { normalizeFrontendSlices } from "../../../lib/models/common/normalizers/slices";
import { normalizeFrontendCustomTypes } from "../../../lib/models/common/normalizers/customType";
import { BackendEnvironment } from "../../../lib/models/common/Environment";
import { PushChangesPayload } from "../../../lib/models/common/TransactionalPush";
import { purge } from "./services/uploadScreenshotClient";
import { uploadScreenshots as uploadScreenshotsClient } from "./services/sliceService";
import { compareScreenshots } from "../../../lib/models/common/ModelStatus/compareSliceModels";

type TransactionalPushBody = {
  body: PushChangesPayload;
  env: BackendEnvironment;
};

export default async function handler({
  body,
  env,
}: TransactionalPushBody): Promise<
  ApiResult<{ status: number; body: Limit | null }>
> {
  debugger;
  const { cwd, client, manifest } = env;

  if (!manifest.libraries)
    return {
      status: 400,
      body: null,
    };

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

  const localLibraries: ReadonlyArray<Library<Component>> = Libraries.libraries(
    cwd,
    manifest.libraries
  );

  debugger;

  /* -- Assemble the models together and compute their statuses -- */
  const slicesModels: ReadonlyArray<LocalOrRemoteSlice> =
    normalizeFrontendSlices(localLibraries, remoteSlices);
  const customTypeModels: ReadonlyArray<LocalOrRemoteCustomType> =
    Object.values(
      normalizeFrontendCustomTypes(localCustomTypes, remoteCustomTypes)
    );

  /* -- Compute the request body -- */

  const slicesWithStatus = slicesModels.map((s) => ({
    ...computeModelStatus(s, true),
  }));

  const uploadAndUpdate = async (slice: SliceSM) => {
    const libraryName =
      localLibraries.find((library) =>
        library.components.some((component) => component.model.id === slice.id)
      )?.name ?? "";
    const screenshotUrlsByVariation = await uploadScreenshotsClient(
      env,
      slice,
      slice.name,
      libraryName
    );
    return {
      ...slice,
      variations: slice.variations.map((v) => ({
        ...v,
        imageUrl: screenshotUrlsByVariation[v.id] ?? v.imageUrl,
      })),
    };
  };

  const newScreenshots = await Promise.allSettled(
    slicesWithStatus.map(async (m) => {
      switch (m.status) {
        case ModelStatus.New: {
          const payload = Slices.fromSM(await uploadAndUpdate(m.model.local));
          return {
            type: ChangeTypes.SLICE_INSERT,
            id: payload.id,
            payload,
          };
        }
        case ModelStatus.Deleted: {
          const { err: purgeError } = await purge(env, getModelId(m.model)); // throw this?
          if (purgeError) throw purgeError;
          return {
            type: ChangeTypes.SLICE_DELETE,
            id: m.model.remote.id,
            payload: { id: m.model.remote.id },
          };
        }
        case ModelStatus.Modified: {
          debugger;
          let sliceModel = m.model.local;
          if (!compareScreenshots(m.model.remote, m.model.localScreenshots)) {
            const { err: purgeError } = await purge(env, getModelId(m.model)); // throw this?
            if (purgeError) throw purgeError;
            sliceModel = await uploadAndUpdate(m.model.local);
          } else {
            sliceModel = {
              ...sliceModel,
              variations: sliceModel.variations.map((v) => ({
                ...v,
                imageUrl: m.model.remote.variations.find((vv) => vv.id === v.id)
                  ?.imageUrl,
              })),
            };
          }
          console.log(sliceModel);
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

  const isFulfilled = <T>(
    promiseResult: PromiseSettledResult<T>
  ): promiseResult is PromiseFulfilledResult<T> =>
    promiseResult.status === "fulfilled";

  const sliceChanges = newScreenshots
    .filter(isFulfilled)
    .map((r) => r.value)
    .filter(
      (m): m is SliceInsertChange | SliceUpdateChange | SliceDeleteChange =>
        m !== undefined
    );

  const customTypeChanges = customTypeModels.reduce(
    (
      acc: (
        | CustomTypeInsertChange
        | CustomTypeUpdateChange
        | CustomTypeDeleteChange
      )[],
      customType: LocalOrRemoteCustomType
    ) => {
      // assessing the user is connected if we went that far in the processing
      const statusResult = computeModelStatus(customType, true);

      switch (statusResult.status) {
        case ModelStatus.New: {
          const payload = CustomTypes.fromSM(statusResult.model.local);
          const customTypeInsert: CustomTypeInsertChange = {
            type: ChangeTypes.CUSTOM_TYPE_INSERT,
            id: payload.id,
            payload,
          };
          return [...acc, customTypeInsert];
        }

        case ModelStatus.Modified: {
          const payload = CustomTypes.fromSM(statusResult.model.local);
          const customTypeUpdate: CustomTypeUpdateChange = {
            type: ChangeTypes.CUSTOM_TYPE_UPDATE,
            id: payload.id,
            payload,
          };
          return [...acc, customTypeUpdate];
        }

        case ModelStatus.Deleted: {
          const payload = CustomTypes.fromSM(statusResult.model.remote);
          const customTypeDelete: CustomTypeDeleteChange = {
            type: ChangeTypes.CUSTOM_TYPE_DELETE,
            id: payload.id,
            payload: { id: payload.id },
          };
          return [...acc, customTypeDelete];
        }

        default: {
          return acc;
        }
      }
    },
    []
  );

  const newBody: BulkBody = {
    confirmDeleteDocuments: body.confirmDeleteDocuments,
    changes: [...sliceChanges, ...customTypeChanges],
  };

  console.log(sliceChanges);

  return client
    .bulk(newBody)
    .then((potentialLimit: Limit | null) => ({
      status: 200,
      body: potentialLimit,
    }))
    .catch((error: ClientError) => onError(error.message, error.status));
}
