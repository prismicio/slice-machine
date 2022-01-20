import type Models from "@slicemachine/core/build/src/models";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { snakelize } from "@lib/utils/str";
import path from "path";
import uniqid from "uniqid";

import { BackendEnvironment } from "@lib/models/common/Environment";

import { s3DefaultPrefix } from "@lib/consts";

export async function purge(
  env: BackendEnvironment,
  slices: ReadonlyArray<Models.SliceAsObject>,
  sliceName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any
  onError: (error?: any, msg?: string) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any
  onError: (error?: any, msg?: string) => any
) {
  console.log("[slice/push]: uploading variation preview");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/await-thenable
  const aclResponse: any = await (await env.client.images.createAcl()).json();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  const maybeErrorMessage =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
    aclResponse.error || aclResponse.Message || aclResponse.message;
  if (maybeErrorMessage) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const msg =
      maybeErrorMessage ||
      "An error occurred while creating ACL - please contact support";
    console.error(msg);
    console.error(`Full error: ${JSON.stringify(aclResponse)}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
    return onError(aclResponse, msg);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {
    values: { url, fields },
    imgixEndpoint,
  } = aclResponse;

  const filename = path.basename(filePath);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/restrict-template-expressions
  const key = `${env.repo}/${s3DefaultPrefix}/${snakelize(
    sliceName
  )}/${snakelize(variationId)}-${uniqid()}/${filename}`;
  const postStatus = await env.client.images.post({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    url,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    fields,
    key,
    filename,
    pathToFile: filePath,
  });

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const s3ImageUrl = `${imgixEndpoint}/${key}`;

  if (postStatus !== 204) {
    const msg =
      "[slice/push] An error occured while uploading files - please contact support";
    console.error(msg);
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(`Error code: "${postStatus}"`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { err: onError(null, msg) };
  }

  return { s3ImageUrl };
}
