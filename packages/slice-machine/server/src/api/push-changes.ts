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
import {
  Slices,
  VariationSM,
  type SliceSM,
} from "@slicemachine/core/build/models/Slice";
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
  hasLocal,
  LocalOnlySlice,
  LocalOrRemoteCustomType,
  LocalOrRemoteSlice,
} from "../../../lib/models/common/ModelData";

import { normalizeFrontendSlices } from "../../../lib/models/common/normalizers/slices";
import { normalizeFrontendCustomTypes } from "../../../lib/models/common/normalizers/customType";
import { BackendEnvironment } from "../../../lib/models/common/Environment";
import { PushChangesPayload } from "../../../lib/models/common/TransactionalPush";
import { purge, upload } from "./services/uploadScreenshotClient";
import { uploadScreenshots } from "./services/sliceService";

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

  const localSlices: ReadonlyArray<Library<Component>> = Libraries.libraries(
    cwd,
    manifest.libraries
  );

  /* -- Assemble the models together and compute their statuses -- */
  const slicesModels: ReadonlyArray<LocalOrRemoteSlice> =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    normalizeFrontendSlices(localSlices, remoteSlices);
  const customTypeModels: ReadonlyArray<LocalOrRemoteCustomType> =
    Object.values(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      normalizeFrontendCustomTypes(localCustomTypes, remoteCustomTypes)
    );

  /* -- Compute the request body -- */

  const sliceChanges = slicesModels.reduce(
    (
      acc: (SliceInsertChange | SliceUpdateChange | SliceDeleteChange)[],
      slice: LocalOrRemoteSlice
    ) => {
      // assessing the user is connected if we went that far in the processing
      const statusResult = computeModelStatus(slice, true);

      switch (statusResult.status) {
        case ModelStatus.New: {
          const payload = Slices.fromSM(statusResult.model.local);
          const sliceInsert: SliceInsertChange = {
            type: ChangeTypes.SLICE_INSERT,
            id: payload.id,
            payload,
          };
          return [...acc, sliceInsert];
        }

        case ModelStatus.Modified: {
          const payload = Slices.fromSM(statusResult.model.local);
          const sliceUpdate: SliceUpdateChange = {
            type: ChangeTypes.SLICE_UPDATE,
            id: payload.id,
            payload,
          };
          return [...acc, sliceUpdate];
        }

        case ModelStatus.Deleted: {
          const payload = Slices.fromSM(statusResult.model.remote);
          const sliceDelete: SliceDeleteChange = {
            type: ChangeTypes.SLICE_DELETE,
            id: payload.id,
            payload: { id: payload.id },
          };
          return [...acc, sliceDelete];
        }

        default: {
          return acc;
        }
      }
    },
    []
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

  const newbody: BulkBody = {
    confirmDeleteDocuments: body.confirmDeleteDocuments,
    changes: [...sliceChanges, ...customTypeChanges],
  };

  /* -- Bulk the changes and send back the result -- */
  try {
    const result: Limit | null = await client.bulk(newbody);

    const updateScreenshotsPromises = await Promise.all(
      sliceChanges.map(async (sliceChange) => {
        // finding the remote model of the Slice we are pushing
        // removing existing screenshots that have been previously uploaded
        const slice = slicesModels.find(
          (s) => getModelId(s) === sliceChange.id
        );
        if (!slice || !hasLocal(slice)) {
          return;
        }

        const localSliceLib = {
          ...slice,
          library: localSlices.find((library) =>
            library.components.some(
              (component) => component.model.id === slice.local.id
            )
          )?.name,
        };

        const { err: purgeError } = await purge(env, getModelId(slice));
        if (purgeError) {
          console.error(
            `[slice/push]: Unexpected error while removing previously uploaded screenshots: ${purgeError.reason}`
          );
          return { statusCode: purgeError.status };
        }

        const screenshotUrlsByVariation: Record<string, string | null> =
          await uploadScreenshots(
            env,
            slice.local,
            slice.local.name,
            localSliceLib.library ?? ""
          );

        const modelWithScreenshots: SliceSM = {
          ...slice.local,
          variations: slice.local.variations.map((variation: VariationSM) => {
            const screenshotUploaded = screenshotUrlsByVariation[variation.id];

            if (!screenshotUploaded) return variation;
            return {
              ...variation,
              imageUrl: screenshotUploaded,
            };
          }),
        };

        return modelWithScreenshots;
      })
    );

    console.log(updateScreenshotsPromises[0].variations[0].imageUrl);

    return {
      status: 200,
      body: result,
    };
  } catch (error) {
    // Write actual guard next to the type
    // Also should split to handle the bulk and screenshots errors separatly
    const isClientError = (e: unknown): e is ClientError => true;
    if (isClientError(error)) {
      return onError(error.message, error.status);
    }
    throw error;
  }
  // return client
  //   .bulk(newbody)
  //   .then((potentialLimit: Limit | null) => ({
  //     status: 200,
  //     body: potentialLimit,
  //   }))
  //   .catch((error: ClientError) => onError(error.message, error.status));
}
