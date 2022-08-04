import { BackendEnvironment } from "../../../../lib/models/common/Environment";
import { ApiError, isApiError } from "../../../../lib/models/server/ApiResult";
import { onError } from "../common/error";
import { SliceSM } from "@slicemachine/core/build/models";
import { Acl, ClientError } from "@slicemachine/client";

export const purge = async (
  env: BackendEnvironment,
  slices: ReadonlyArray<SliceSM>,
  sliceId: string
): Promise<{ err?: ApiError }> => {
  if (slices.find((e) => e.id === sliceId)) {
    console.log("\n[slice/push]: purging images folder");

    return env.client
      .deleteScreenshotFolder(sliceId)
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
  sliceId: string,
  variationId: string,
  filePath: string
): Promise<{ s3ImageUrl?: string; err?: ApiError }> => {
  console.log("[slice/push]: uploading variation preview");

  const aclOrErr: Acl | ApiError = await env.client
    .createAcl()
    .catch((error: ClientError) => {
      // An error happened in the ACL creation
      console.error(error.message);
      return onError(error.message);
    });

  if (isApiError(aclOrErr)) return { err: aclOrErr };

  return env.client
    .uploadScreenshot({
      acl: aclOrErr,
      sliceId,
      variationId,
      filePath,
    })
    .then((assetUrl) => ({ s3ImageUrl: assetUrl }))
    .catch((error: ClientError) => {
      const msg =
        "[slice/push] An error occurred while uploading files - please contact support";
      console.error(msg);
      console.error(`Full error: ${error.message}`);

      return { err: onError(msg) };
    });
};
