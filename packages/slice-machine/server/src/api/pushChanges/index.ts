import {
  type Limit,
  type BulkBody,
  type ClientError,
} from "@slicemachine/client";
import { onError } from "../../../../lib/models/server/ApiResult";
import type { ApiResult } from "../../../../lib/models/server/ApiResult";
import { BackendEnvironment } from "../../../../lib/models/common/Environment";
import * as Sentry from "@sentry/node";
import { fetchModels } from "./fetchModels";
import { buildSliceChanges } from "./buildSliceChanges";
import { getCustomTypesWithInvalidReferences } from "./checkCustomTypes";
import { buildCustomTypeChanges } from "./buildCustomTypeChanges";
import {
  InvalidCustomTypeResponse,
  PushChangesPayload,
} from "../../../../lib/models/common/TransactionalPush";

type TransactionalPushBody = {
  body: PushChangesPayload;
  env: BackendEnvironment;
};

export default async function handler({
  body,
  env,
}: TransactionalPushBody): Promise<
  ApiResult<{ status: number; body: InvalidCustomTypeResponse | Limit | null }>
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
    const { localLibs, remoteSlices, localCustomTypes, remoteCustomTypes } =
      await fetchModels(client, cwd, manifest.libraries);

    const invalidCustomTypes = getCustomTypesWithInvalidReferences(
      localCustomTypes,
      localLibs
    );

    if (invalidCustomTypes.length > 0) {
      return {
        status: 200,
        body: {
          type: "INVALID_CUSTOM_TYPES",
          details: {
            customTypes: invalidCustomTypes,
          },
        },
      };
    }

    const sliceChanges = await buildSliceChanges(env, localLibs, remoteSlices);
    const customTypeChanges = buildCustomTypeChanges(
      localCustomTypes,
      remoteCustomTypes
    );

    // Compute the POST body
    const newbody: BulkBody = {
      confirmDeleteDocuments: body.confirmDeleteDocuments,
      changes: [...sliceChanges, ...customTypeChanges],
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
