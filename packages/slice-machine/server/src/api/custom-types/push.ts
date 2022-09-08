import {
  CustomTypes,
  CustomTypeSM,
} from "@slicemachine/core/build/models/CustomType/index";
import { Client, ClientError } from "@slicemachine/client";
import { CustomTypesPaths } from "../../../../lib/models/paths";
import { ApiResult } from "../../../../lib/models/server/ApiResult";
import { onError } from "../common/error";
import { RequestWithEnv } from "../http/common";
import * as IO from "../../../../lib/io";
import { CustomType } from "@prismicio/types-internal/lib/customtypes/CustomType";

const createOrUpdate = (
  client: Client,
  localCustomType: CustomTypeSM,
  remoteCustomType: CustomType | undefined
) => {
  const model = CustomTypes.fromSM(localCustomType);
  if (remoteCustomType) return client.updateCustomType(model);
  return client.insertCustomType(model);
};

export default async function handler(req: RequestWithEnv): Promise<ApiResult> {
  const { id } = req.query;

  // Path to the local model of the custom type
  const modelPath = CustomTypesPaths(req.env.cwd)
    .customType(id as string)
    .model();

  try {
    const model: CustomTypeSM = IO.CustomType.readCustomType(modelPath);

    // fetching custom types
    const { remoteCustomTypes, error } = await req.env.client
      .getCustomTypes()
      .then((customTypes) => ({ remoteCustomTypes: customTypes, error: null }))
      .catch((error: ClientError) => {
        const message =
          error.status === 403
            ? "Could not fetch remote custom types. Please log in to Prismic!"
            : `You don\'t have access to the repository \"${req.env.repo}\"`;

        return { remoteCustomTypes: [], error: onError(message, error.status) };
      });

    // fetching error to be returned immediatly
    if (error) return error;

    // The remote version of the custom type
    const remoteCustomType = remoteCustomTypes.find(
      (customType) => customType.id === id
    );

    // Verifying the repeatable property is not updated
    if (remoteCustomType && remoteCustomType.repeatable !== model.repeatable) {
      const msg = `[custom-types/push] Model not pushed: property "repeatable" in local Model differs from remote source`;
      console.error(msg);
      return onError(msg);
    }

    console.log("[custom-types/push] Pushing Custom Type...");

    // Pushing the custom types
    return createOrUpdate(req.env.client, model, remoteCustomType)
      .then(() => {
        console.log(`[custom-types/push] Custom Type ${model.id} was pushed!`);
        return {};
      })
      .catch((error: ClientError) => {
        const msg = `[custom-types/push] Unexpected error: ${error.message}`;
        console.error(msg);
        return onError(error.message, error.status);
      });
  } catch (e) {
    const msg = `[custom-types/push] Model ${String(id)} is invalid.`;
    console.error(msg);
    return onError(msg);
  }
}
