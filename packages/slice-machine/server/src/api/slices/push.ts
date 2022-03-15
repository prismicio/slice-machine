import getEnv from "../services/getEnv";
import { getSlices } from "./";

import { onError } from "../common/error";
import { purge } from "../services/uploadScreenshotClient";
import { CustomPaths } from "@lib/models/paths";
import { BackendEnvironment } from "@lib/models/common/Environment";
import type { SliceBody } from "@models/common/Slice";
import { uploadScreenshots, createOrUpdate } from "../services/sliceService";
import { ApiResult } from "@lib/models/server/ApiResult";
import { SliceSM, VariationSM } from "@slicemachine/core/build/src/models";
import * as IO from "../io";

export async function pushSlice(
  env: BackendEnvironment,
  slices: ReadonlyArray<SliceSM>,
  { sliceName, from }: { sliceName: string; from: string }
): Promise<ApiResult> {
  const modelPath = CustomPaths(env.cwd).library(from).slice(sliceName).model();

  try {
    const smModel: SliceSM = IO.Slice.readSlice(modelPath);
    const { err } = await purge(env, slices, sliceName);
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

    const res = await createOrUpdate(
      slices,
      sliceName,
      modelWithImageUrl,
      env.client
    );

    if (res.status > 209) {
      const message = res.text ? await res.text() : res.status.toString();
      console.error(
        `[slice/push] Slice ${sliceName}: Unexpected error returned. Server message: ${message}`
      );
      throw new Error(message);
    }
    console.log("[slice/push] done!");
    return {};
  } catch (e) {
    console.log(e);
    return onError(
      e as Response,
      "[slice/push] An unexpected error occurred while pushing slice"
    );
  }
}

const handler = async (query: SliceBody): Promise<ApiResult> => {
  const { sliceName, from } = query;
  const { env } = await getEnv();

  if (!env.isUserLoggedIn) {
    console.error("[slice/push] An error occurred while fetching slices.");
    const message =
      "Error: Could not fetch remote slices. Please log in to Prismic!";
    return {
      err: new Error(message),
      reason: message,
      status: 403,
    };
  }

  const { slices, err } = await getSlices(env.client);

  if (err) {
    console.error("[slice/push] An error occurred while fetching slices.");

    const errorExplanation =
      err.status === 403
        ? "Please log in to Prismic!"
        : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `You don\'t have access to the repo \"${env.repo}\"`;

    return onError(
      err,
      `Error ${err.status}: Could not fetch remote slices. ${errorExplanation}`
    );
  }

  return pushSlice(env, slices, { sliceName, from });
};

export default handler;
