import { snakelize } from "@lib/utils/str";
import path from "path";
import uniqid from "uniqid";

import { BackendEnvironment } from "@lib/models/common/Environment";
import { ApiError } from "@lib/models/server/ApiResult";

import { s3DefaultPrefix } from "@lib/consts";
import { onError } from "../common/error";
import { SliceSM } from "@slicemachine/core/build/models";

export const purge = async (
  env: BackendEnvironment,
  slices: ReadonlyArray<SliceSM>,
  sliceName: string
): Promise<{ err?: ApiError }> => {
  if (slices.find((e) => e.id === snakelize(sliceName))) {
    console.log("\n[slice/push]: purging images folder");

    return env.client
      .deleteImagesFolderAcl(snakelize(sliceName))
      .then(() => ({}))
      .catch(() => {
        const msg =
          "[slice/push] An error occurred while purging slice folder - please contact support";
        console.error(msg);

        return { err: onError(msg) };
      });
  }

  return {};
};

export const upload = async (
  env: BackendEnvironment,
  sliceName: string,
  variationId: string,
  filePath: string
): Promise<{ s3ImageUrl?: string; err?: ApiError }> => {
  console.log("[slice/push]: uploading variation preview");

  const aclResult = await env.client.createImagesAcl();

  // An error happened in the ACL creation
  const errorMessage: string | undefined =
    aclResult.error || aclResult.Message || aclResult.message;
  if (errorMessage) {
    console.error(errorMessage);
    console.error(`Full error: ${JSON.stringify(aclResult)}`);
    return { err: onError(errorMessage) };
  }

  const {
    values: { url, fields },
    imgixEndpoint,
  } = aclResult;

  const filename = path.basename(filePath);
  const key = `${env.repo}/${s3DefaultPrefix}/${snakelize(
    sliceName
  )}/${snakelize(variationId)}-${uniqid()}/${filename}`;
  const postStatus = await env.client.uploadImageAcl({
    url,
    fields,
    key,
    filename,
    pathToFile: filePath,
  });

  const s3ImageUrl = `${imgixEndpoint}/${key}`;

  if (postStatus !== 204) {
    const msg =
      "[slice/push] An error occurred while uploading files - please contact support";
    console.error(msg);
    postStatus && console.error(`Error code: "${postStatus}"`);

    return { err: onError(msg) };
  }

  return { s3ImageUrl };
};
