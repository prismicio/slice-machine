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
  type Client,
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
import type {
  Component,
  Library,
  Manifest,
} from "@slicemachine/core/build/models";
import {
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

  if (!manifest.libraries) {
    return {
      status: 400,
      body: null,
    };
  }

  try {
    // Fetch all models
    const { localSlices, remoteSlices, localCustomTypes, remoteCustomTypes } =
      await fetchModels(client, cwd, manifest.libraries);

    // Compute the POST body
    const newbody: BulkBody = {
      confirmDeleteDocuments: body.confirmDeleteDocuments,
      changes: await buildChanges(
        env,
        localSlices,
        remoteSlices,
        localCustomTypes,
        remoteCustomTypes
      ),
    };

    // Bulk the changes and send back the result
    return client
      .bulk(newbody)
      .then((potentialLimit: Limit | null) => ({
        status: 200,
        body: potentialLimit,
      }))
      .catch((error: ClientError) => onError(error.message, error.status));
  } catch (e) {
    console.error("An error happened while pushing your changes");
    console.error(e);
    Sentry.captureException(e);

    return onError("An error happened while pushing your changes", 500);
  }
}

/* -- FETCH LOCAL AND REMOTE MODELS -- */
async function fetchModels(
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

/* UPLOAD SLICE SCREENSHOTS AND UPDATE THE MODAL */
async function uploadScreenshotsAndUpdateModel(
  env: BackendEnvironment,
  slice: SliceSM,
  localLibraries: ReadonlyArray<Library<Component>>
) {
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
        screenshotUrlsByVariation[localVariation.id] ?? localVariation.imageUrl,
    })),
  };
}

/* BUILD CHANGES FROM THE MODELS */
async function buildChanges(
  env: BackendEnvironment,
  localSlices: ReadonlyArray<Library<Component>>,
  remoteSlices: SliceSM[],
  localCustomTypes: CustomTypeSM[],
  remoteCustomTypes: CustomTypeSM[]
) {
  // Assemble the models together
  const slicesModels: LocalOrRemoteSlice[] = normalizeFrontendSlices(
    localSlices,
    remoteSlices
  );
  const customTypeModels: ReadonlyArray<LocalOrRemoteCustomType> =
    Object.values(
      normalizeFrontendCustomTypes(localCustomTypes, remoteCustomTypes)
    );

  const sliceChangesWithUndefined = await Promise.all(
    slicesModels.map(async (slice) => {
      // assessing the user is connected if we went that far in the processing
      const statusResult = computeModelStatus(slice, true);

      switch (statusResult.status) {
        case ModelStatus.New: {
          const modelWithScreenshots = await uploadScreenshotsAndUpdateModel(
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
            sliceModel = await uploadScreenshotsAndUpdateModel(
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

  const sliceChanges = sliceChangesWithUndefined.filter(
    (
      change
    ): change is SliceInsertChange | SliceUpdateChange | SliceDeleteChange =>
      change !== undefined
  );

  const customTypeChanges = customTypeModels.reduce<
    (CustomTypeInsertChange | CustomTypeUpdateChange | CustomTypeDeleteChange)[]
  >((acc, customType) => {
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
  }, []);

  return [...sliceChanges, ...customTypeChanges];
}
