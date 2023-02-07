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
import type {
  LocalOrRemoteCustomType,
  LocalOrRemoteSlice,
} from "../../../lib/models/common/ModelData";

import { normalizeFrontendSlices } from "../../../lib/models/common/normalizers/slices";
import { normalizeFrontendCustomTypes } from "../../../lib/models/common/normalizers/customType";
import { BackendEnvironment } from "../../../lib/models/common/Environment";
import { PushChangesPayload } from "../../../lib/models/common/TransactionalPush";

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

  // Fetch all models
  const { localSlices, remoteSlices, localCustomTypes, remoteCustomTypes } =
    await fetchModels(client, cwd, manifest.libraries);

  // Assemble the models together
  const slicesModels: LocalOrRemoteSlice[] = normalizeFrontendSlices(
    localSlices,
    remoteSlices
  );
  const customTypeModels: ReadonlyArray<LocalOrRemoteCustomType> =
    Object.values(
      normalizeFrontendCustomTypes(localCustomTypes, remoteCustomTypes)
    );

  // Compute the POST body
  const newbody: BulkBody = {
    confirmDeleteDocuments: body.confirmDeleteDocuments,
    changes: buildChanges(slicesModels, customTypeModels),
  };

  // Bulk the changes and send back the result
  return client
    .bulk(newbody)
    .then((potentialLimit: Limit | null) => ({
      status: 200,
      body: potentialLimit,
    }))
    .catch((error: ClientError) => onError(error.message, error.status));
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

/* BUILD CHANGES FROM THE MODELS */
function buildChanges(
  slicesModels: LocalOrRemoteSlice[],
  customTypeModels: ReadonlyArray<LocalOrRemoteCustomType>
) {
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

  return [...sliceChanges, ...customTypeChanges];
}
