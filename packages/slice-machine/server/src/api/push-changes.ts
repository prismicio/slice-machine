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
import * as Sentry from "@sentry/node";

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

  const localLibraries: ReadonlyArray<Library<Component>> = Libraries.libraries(
    cwd,
    manifest.libraries
  );

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
      variations: slice.variations.map((localVariation) => ({
        ...localVariation,
        imageUrl:
          screenshotUrlsByVariation[localVariation.id] ??
          localVariation.imageUrl,
      })),
    };
  };

  try {
    const newScreenshots = await Promise.all(
      slicesWithStatus.map(async (s) => {
        switch (s.status) {
          case ModelStatus.New: {
            const payload = Slices.fromSM(await uploadAndUpdate(s.model.local));
            return {
              type: ChangeTypes.SLICE_INSERT,
              id: payload.id,
              payload,
            };
          }
          case ModelStatus.Deleted: {
            const { err: purgeError } = await purge(env, getModelId(s.model));
            if (purgeError) throw purgeError;
            return {
              type: ChangeTypes.SLICE_DELETE,
              id: s.model.remote.id,
              payload: { id: s.model.remote.id },
            };
          }
          case ModelStatus.Modified: {
            let sliceModel = s.model.local;
            if (!compareScreenshots(s.model.remote, s.model.localScreenshots)) {
              const { err: purgeError } = await purge(env, getModelId(s.model));
              if (purgeError) throw purgeError;
              sliceModel = await uploadAndUpdate(s.model.local);
            } else {
              sliceModel = {
                ...sliceModel,
                variations: sliceModel.variations.map((localVariation) => ({
                  ...localVariation,
                  imageUrl: s.model.remote.variations.find(
                    (remoteVariation) =>
                      remoteVariation.id === localVariation.id
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

    const sliceChanges = newScreenshots.filter(
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

    return client
      .bulk(newBody)
      .then((potentialLimit: Limit | null) => ({
        status: 200,
        body: potentialLimit,
      }))
      .catch((error: ClientError) => onError(error.message, error.status));
  } catch (e) {
    console.error("An error happened while pushing your changes");
    console.error(e);
    Sentry.captureException(e);

    return onError("failed", 500);
  }
}
