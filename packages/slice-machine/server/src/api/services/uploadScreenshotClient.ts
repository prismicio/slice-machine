import { BackendEnvironment } from "../../../../lib/models/common/Environment";
import { ApiError, isApiError } from "../../../../lib/models/server/ApiResult";
import { onError } from "../common/error";
import { Acl, ClientError } from "@slicemachine/client";

export const purge = async (
  env: BackendEnvironment,
  sliceId: string
): Promise<{ err?: ApiError }> => {
  return env.client
    .deleteScreenshotFolder(sliceId)
    .then(() => ({}))
    .catch(() => {
      const msg =
        "[slice/push] An error occurred while purging slice folder - please contact support";
      console.error(msg);

      return { err: onError(msg) };
    });
};

export const upload = async (
  env: BackendEnvironment,
  sliceId: string,
  variationId: string,
  filePath: string
): Promise<{ s3ImageUrl?: string; err?: ApiError }> => {
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
        "[slice/push] An error occurred while uploading screenshots - please contact support";
      console.error(msg);
      console.error(`Full error: ${error.message}`);

      return { err: onError(msg) };
    });
};
