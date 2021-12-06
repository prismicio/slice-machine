// @ts-ignore
import { snakelize } from "@lib/utils/str";
import path from "path";
import uniqid from "uniqid";

import BackendEnvironment from "@lib/models/common/Environment";
import Slice from "@lib/models/common/Slice";
import { AsObject } from "@lib/models/common/Variation";

import { s3DefaultPrefix } from "@lib/consts";

export async function purge(
  env: BackendEnvironment,
  slices: ReadonlyArray<Slice<AsObject>>,
  sliceName: string,
  onError: (error?: any, msg?: string) => any
): Promise<{ err?: any }> {
  if (slices.find((e) => e.id === snakelize(sliceName))) {
    console.log("\n[slice/push]: purging images folder");
    const deleteRes = await env.client.images.deleteFolder({
      sliceName: snakelize(sliceName),
    });
    if (deleteRes.status > 209) {
      const msg =
        "[slice/push] An error occured while purging slice folder - please contact support";
      console.error(msg);
      return { err: onError(deleteRes, msg) };
    }
  }

  return {};
}

export async function upload(
  env: BackendEnvironment,
  sliceName: string,
  variationId: string,
  filePath: string,
  onError: (error?: any, msg?: string) => any
) {
  console.log("[slice/push]: uploading variation preview");
  const aclResponse: any = await (await env.client.images.createAcl()).json();
  const maybeErrorMessage =
    aclResponse.error || aclResponse.Message || aclResponse.message;
  if (maybeErrorMessage) {
    const msg =
      maybeErrorMessage ||
      "An error occured while creating ACL - please contact support";
    console.error(msg);
    console.error(`Full error: ${JSON.stringify(aclResponse)}`);
    return onError(aclResponse, msg);
  }
  const {
    values: { url, fields },
    imgixEndpoint,
  } = aclResponse;

  const filename = path.basename(filePath);
  const key = `${env.repo}/${s3DefaultPrefix}/${snakelize(
    sliceName
  )}/${snakelize(variationId)}-${uniqid()}/${filename}`;
  const postStatus = await env.client.images.post({
    url,
    fields,
    key,
    filename,
    pathToFile: filePath,
  });

  const s3ImageUrl = `${imgixEndpoint}/${key}`;

  if (postStatus !== 204) {
    const msg =
      "[slice/push] An error occured while uploading files - please contact support";
    console.error(msg);
    console.error(`Error code: "${postStatus}"`);
    return { err: onError(null, msg) };
  }

  return { s3ImageUrl };
}
