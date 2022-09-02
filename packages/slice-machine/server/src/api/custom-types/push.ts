import {
  CustomTypes,
  CustomTypeSM,
} from "@slicemachine/core/build/models/CustomType/index";
import { Client, ClientError } from "@slicemachine/client";
import { CustomTypesPaths } from "../../../../lib/models/paths";
import { ApiResult } from "../../../../lib/models/server/ApiResult";

import { getBackendState } from "../state";
import { onError } from "../common/error";
import { RequestWithEnv } from "../http/common";
import * as IO from "../../../../lib/io";

const createOrUpdate = (
  client: Client,
  smModel: CustomTypeSM,
  remoteCustomType: CustomTypeSM | undefined
) => {
  const model = CustomTypes.fromSM(smModel);
  if (remoteCustomType) return client.updateCustomType(model);
  return client.insertCustomType(model);
};

export default async function handler(req: RequestWithEnv): Promise<ApiResult> {
  const { id } = req.query;

  const state = await getBackendState(req.errors, req.env);

  if (!state.libraries) {
    const code = 400;
    const message = `Error ${code}: Slice libraries needs to be define in your sm.json file.`;

    return {
      err: new Error(message),
      reason: message,
      status: code,
    };
  }

  if (state.clientError) {
    const isAnAuthenticationError =
      state.clientError && state.clientError.status === 403;
    const errorExplanation = isAnAuthenticationError
      ? "Please log in to Prismic!"
      : `You don't have access to the repo "${state.env.repo}"`;

    const errorCode = state.clientError ? state.clientError.status : 403;
    const message = `Error ${errorCode}: Could not fetch remote custom types. ${errorExplanation}`;

    return {
      err: new Error(message),
      reason: message,
      status: errorCode,
    };
  }

  const modelPath = CustomTypesPaths(state.env.cwd)
    .customType(id as string)
    .model();

  let model: CustomTypeSM;
  try {
    model = IO.CustomType.readCustomType(modelPath);
  } catch (e) {
    const msg = `[custom-types/push] Model ${String(id)} is invalid.`;
    console.error(msg);
    return onError(msg);
  }

  const remoteCustomType = state.remoteCustomTypes.find(
    (e: { id: string }) => e.id === id
  );
  if (remoteCustomType && remoteCustomType.repeatable !== model.repeatable) {
    const msg = `[custom-types/push] Model not pushed: property "repeatable" in local Model differs from remote source`;
    console.error(msg);
    return onError(msg);
  }

  console.log("[custom-types/push] Pushing Custom Type...");

  return createOrUpdate(state.env.client, model, remoteCustomType)
    .then(() => {
      console.log(`[custom-types/push] Custom Type ${model.id} was pushed!`);
      return {};
    })
    .catch((error: ClientError) => {
      const msg = `[custom-types/push] Unexpected error: ${error.message}`;
      console.error(msg);
      return onError(msg, error.status);
    });
}
