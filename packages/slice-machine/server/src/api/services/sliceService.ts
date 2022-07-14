import path from "path";
import { Client } from "@slicemachine/client";
import { resolvePathsToScreenshot } from "@slicemachine/core/build/libraries/screenshot";

import { upload } from "./uploadScreenshotClient";
import { BackendEnvironment } from "@lib/models/common/Environment";
import { ApiError } from "@lib/models/server/ApiResult";
import {
  Slices,
  SliceSM,
  VariationSM,
} from "@slicemachine/core/build/models/Slice";

export const createOrUpdate = async (
  slices: ReadonlyArray<SliceSM>,
  model: SliceSM,
  client: Client
) => {
  const prismicModel = Slices.fromSM(model);

  if (slices.find((e) => e.id === model.id)) {
    return client.updateSlice(prismicModel);
  } else {
    return client.insertSlice(prismicModel);
  }
};

export async function uploadScreenshots(
  env: BackendEnvironment,
  sliceModel: SliceSM,
  sliceName: string,
  from: string
): Promise<{ [variationId: string]: string | null }> {
  const variationIds: string[] = sliceModel.variations.map(
    (v: VariationSM) => v.id
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
        await upload(env, sliceModel, variationId, screenshot.path);

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
