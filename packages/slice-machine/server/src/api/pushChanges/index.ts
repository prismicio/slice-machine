import {
  type Limit,
  type BulkBody,
  type ClientError,
} from "@slicemachine/client";
import { onError } from "../../../../lib/models/server/ApiResult";
import type { ApiResult } from "../../../../lib/models/server/ApiResult";
import { BackendEnvironment } from "../../../../lib/models/common/Environment";
import { PushChangesPayload } from "../../../../lib/models/common/TransactionalPush";
import * as Sentry from "@sentry/node";
import { fetchModels } from "./fetchModels";
import { buildSliceChanges } from "./buildSliceChanges";
import { buildCustomTypeChanges } from "./buildCustomTypeChanges";

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

    const sliceChanges = await buildSliceChanges(
      env,
      localSlices,
      remoteSlices
    );
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
