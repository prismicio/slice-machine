import {
  CustomTypes,
  CustomTypeSM,
} from "@prismic-beta/slicemachine-core/build/models/CustomType/index";
import { Client, ClientError } from "@slicemachine/client";
import { CustomTypesPaths } from "../../../../lib/models/paths";
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

export async function handler(
  req: RequestWithEnv
): Promise<{ statusCode: number }> {
  const { id } = req.query;
  if (typeof id != "string") return { statusCode: 418 }; // Should never happen

  // Path to the local model of the custom type
  const modelPath = CustomTypesPaths(req.env.cwd).customType(id).model();

  try {
    const model: CustomTypeSM = IO.CustomType.readCustomType(modelPath);

    // fetching custom types
    const { remoteCustomTypes, error } = await req.env.client
      .getCustomTypes()
      .then((customTypes) => ({ remoteCustomTypes: customTypes, error: null }))
      .catch((error: ClientError) => {
        if (error.status === 401)
          console.error(
            `[custom-types/push] Could not fetch custom types, you don\'t have access to the repository \"${req.env.repo}\"`
          );

        if (![400, 401, 403].includes(error.status))
          console.error(
            `[custom-types/push] Could not fetch custom types. Unexpected error: ${error.message}`
          );

        return { remoteCustomTypes: [], error };
      });

    // fetching error to be returned immediatly
    if (error) return { statusCode: error.status };

    // The remote version of the custom type
    const remoteCustomType = remoteCustomTypes.find(
      (customType) => customType.id === id
    );

    // Verifying the repeatable property is not updated
    if (remoteCustomType && remoteCustomType.repeatable !== model.repeatable) {
      console.error(
        `[custom-types/push] The custom type ${id} couldn't be pushed, the property "repeatable" in local Model differs from remote source`
      );
      return { statusCode: 400 };
    }

    // Pushing the custom types
    return createOrUpdate(req.env.client, model, remoteCustomType)
      .then(() => {
        console.log(
          `[custom-types/push] Custom Type ${id} pushed successfully!`
        );
        return { statusCode: 200 };
      })
      .catch((error: ClientError) => {
        console.error(
          `[custom-types/push] Unexpected error while pushing the Custom Type ${id}: ${error.message}`
        );
        return { statusCode: error.status };
      });
  } catch (e) {
    console.error(
      `[custom-types/push] Unexpected error while pushing the Custom Type ${id}: ${
        e as string
      }`
    );
    return { statusCode: 500 };
  }
}
