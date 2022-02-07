import path from "path";
import type Models from "@slicemachine/core/build/src/models";
import { resolvePathsToScreenshot } from "@slicemachine/core/build/src/libraries/screenshot";

import { upload } from "./uploadScreenshotClient";
import { BackendEnvironment } from "@lib/models/common/Environment";
import DefaultClient from "@models/common/http/DefaultClient";
import FakeClient from "@models/common/http/FakeClient";
import { snakelize } from "@lib/utils/str";
import { ApiError } from "@lib/models/server/ApiResult";

export const createOrUpdate = async (
  slices: ReadonlyArray<Models.SliceAsObject>,
  sliceName: string,
  model: Models.SliceAsObject,
  client: DefaultClient | FakeClient
) => {
  if (slices.find((e) => e.id === snakelize(sliceName))) {
    return await client.updateSlice(model);
  } else {
    return await client.insertSlice(model);
  }
};

export async function uploadScreenshots(
  env: BackendEnvironment,
  sliceModel: Models.SliceAsObject,
  sliceName: string,
  from: string
): Promise<{ [variationId: string]: string | null }> {
  const variationIds: string[] = sliceModel.variations.map(
    (v: Models.VariationAsObject) => v.id
  );

  const imageUrlsByVariation: { [variationId: string]: string | null } = {};

  for (let i = 0; i < variationIds.length; i += 1) {
    const variationId = variationIds[i];

    const screenshot = resolvePathsToScreenshot({
      paths: [env.cwd, path.join(env.cwd, ".slicemachine/assets")],
      from,
      sliceName,
      variationId,
    });

    if (!!screenshot) {
      const { err, s3ImageUrl }: { err?: ApiError; s3ImageUrl?: string } =
        await upload(env, sliceName, variationId, screenshot.path);

      if (err) throw new Error(err.reason);

      imageUrlsByVariation[variationId] = !!s3ImageUrl ? s3ImageUrl : null;
    } else {
      console.error(
        `--- Unable to find a screenshot for slice ${sliceName} | variation ${variationId}`
      );
      imageUrlsByVariation[variationId] = null;
    }
  }

  return imageUrlsByVariation;
}
