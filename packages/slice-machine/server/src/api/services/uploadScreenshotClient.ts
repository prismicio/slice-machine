import { snakelize } from "@lib/utils/str";
import path from "path";
import uniqid from "uniqid";

import { BackendEnvironment } from "@lib/models/common/Environment";
import { ApiError } from "@lib/models/server/ApiResult";

import { s3DefaultPrefix } from "@lib/consts";
import { onError } from "../common/error";
import { SliceSM } from "@slicemachine/core/build/models";
import { AclCreateResult } from "@lib/models/server/Client/Acl";

export const purge = async (
  env: BackendEnvironment,
  slices: ReadonlyArray<SliceSM>,
  sliceName: string
): Promise<{ err?: ApiError }> => {
  if (slices.find((e) => e.id === snakelize(sliceName))) {
    console.log("\n[slice/push]: purging images folder");
    const deleteRes = await env.client.deleteImagesFolderAcl({
      sliceName: snakelize(sliceName),
    });
    if (deleteRes.status > 209) {
      const msg =
        "[slice/push] An error occurred while purging slice folder - please contact support";
      console.error(msg);
      return { err: onError(null, msg) };
    }
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

  const aclResult: AclCreateResult = await env.client.createImagesAcl();

  // An error happened in the ACL creation
  const errorMessage: string | undefined =
    aclResult.error || aclResult.Message || aclResult.message;
  if (errorMessage) {
    console.error(errorMessage);
    console.error(`Full error: ${JSON.stringify(aclResult)}`);
    return { err: onError(null, errorMessage) };
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

    return { err: onError(null, msg) };
  }

  return { s3ImageUrl };
};
