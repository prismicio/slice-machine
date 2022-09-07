import getEnv from "../services/getEnv";
import { getSlices } from ".";

import { onError } from "../common/error";
import { purge } from "../services/uploadScreenshotClient";
import { CustomPaths } from "../../../../lib/models/paths";
import { BackendEnvironment } from "../../../../lib/models/common/Environment";
import type { SliceBody } from "../../../../lib/models/common/Slice";
import { uploadScreenshots, createOrUpdate } from "../services/sliceService";
import { ApiResult } from "../../../../lib/models/server/ApiResult";
import { SliceSM, VariationSM } from "@slicemachine/core/build/models";
import * as IO from "../../../../lib/io";
import { ClientError } from "@slicemachine/client";

export async function pushSlice(
  env: BackendEnvironment,
  slices: ReadonlyArray<SliceSM>,
  { sliceName, from }: { sliceName: string; from: string }
): Promise<ApiResult<Record<string, string | null>>> {
  const modelPath = CustomPaths(env.cwd).library(from).slice(sliceName).model();

  try {
    const smModel: SliceSM = IO.Slice.readSlice(modelPath);
    const { err } = await purge(env, slices, smModel.id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return
    if (err) return err;

    const screenshotUrlsByVariation: Record<string, string | null> =
      await uploadScreenshots(env, smModel, sliceName, from);

    console.log("[slice/push]: pushing slice model to Prismic");

    const variations = smModel.variations.map((variation: VariationSM) => {
      const imageUrl = screenshotUrlsByVariation[variation.id];
      if (!imageUrl) return variation;

      return {
        ...variation,
        imageUrl,
      };
    });

    const modelWithImageUrl: SliceSM = {
      ...smModel,
      variations,
    };

    return createOrUpdate(slices, modelWithImageUrl, env.client)
      .then(() => {
        console.log("[slice/push] done!");
        return screenshotUrlsByVariation;
      })
      .catch((error: ClientError) => {
        const message = `[slice/push] Slice ${modelWithImageUrl.name}: Unexpected error: ${error.message}`;

        console.log(message);
        return onError(
          "[slice/push] An unexpected error occurred while pushing slice",
          error.status
        );
      });
  } catch (e) {
    console.log(e);
    return onError(
      "[slice/push] An unexpected error occurred while pushing slice"
    );
  }
}

const handler = async (query: SliceBody): ReturnType<typeof pushSlice> => {
  const { sliceName, from } = query;
  const { env } = await getEnv();
  const { slices, err } = await getSlices(env.client);

  if (err) {
    console.error("[slice/push] An error occurred while fetching slices.");

    const message =
      err.status === 403
        ? "Could not fetch remote slices. Please log in to Prismic!"
        : `You don\'t have access to the repository \"${env.repo}\"`;

    return onError(message, err.status);
  }

  return pushSlice(env, slices, { sliceName, from });
};

export default handler;
