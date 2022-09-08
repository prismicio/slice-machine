import { getSlices } from ".";

import { onError } from "../common/error";
import { purge } from "../services/uploadScreenshotClient";
import { CustomPaths } from "../../../../lib/models/paths";
import { uploadScreenshots } from "../services/sliceService";
import { ApiResult } from "../../../../lib/models/server/ApiResult";
import { Slices, SliceSM, VariationSM } from "@slicemachine/core/build/models";
import * as IO from "../../../../lib/io";
import { Client, ClientError } from "@slicemachine/client";
import { RequestWithEnv } from "../http/common";

export const createOrUpdate = async (
  client: Client,
  localSlice: SliceSM,
  remoteSlice: SliceSM | undefined
) => {
  const model = Slices.fromSM(localSlice);
  if (remoteSlice) return client.updateSlice(model);
  else return client.insertSlice(model);
};

const handler = async (req: RequestWithEnv): Promise<ApiResult> => {
  const { sliceName, from } = req.query;

  // Path to the local model of the slice
  const modelPath = CustomPaths(req.env.cwd)
    .library(from as string)
    .slice(sliceName as string)
    .model();

  try {
    const smModel: SliceSM = IO.Slice.readSlice(modelPath);

    // Fetching remote Slices
    const { slices: remoteSlices, err: FetchRemoteSlicesError } =
      await getSlices(req.env.client);

    // fetching error to be returned immediatly
    if (FetchRemoteSlicesError) {
      console.error("[slice/push] An error occurred while fetching slices.");

      const message =
        FetchRemoteSlicesError.status === 403
          ? "Could not fetch remote slices. Please log in to Prismic!"
          : `You don\'t have access to the repository \"${req.env.repo}\"`;

      return onError(message, FetchRemoteSlicesError.status);
    }

    // finding the remote model of the Slice we are pushing
    const remoteSlice = remoteSlices.find((slice) => slice.id === smModel.id);

    // removing existing screenshots that have been previously uploaded
    if (remoteSlice) {
      console.log("\n[slice/push]: purging images folder");
      const { err: purgeError } = await purge(req.env, smModel.id);
      if (purgeError) return purgeError;
    }

    // Uploading screenshots for all variations of the slice
    const screenshotUrlsByVariation: Record<string, string | null> =
      await uploadScreenshots(
        req.env,
        smModel,
        sliceName as string,
        from as string
      );

    const modelWithScreenshots: SliceSM = {
      ...smModel,
      variations: smModel.variations.map((variation: VariationSM) => {
        const screenshotUploaded = screenshotUrlsByVariation[variation.id];

        if (!screenshotUploaded) return variation;
        return {
          ...variation,
          imageUrl: screenshotUploaded,
        };
      }),
    };

    console.log("[slice/push]: pushing slice model to Prismic");

    // Pushing the slice
    return createOrUpdate(req.env.client, modelWithScreenshots, remoteSlice)
      .then(() => {
        console.log("[slice/push] done!");
        return {};
      })
      .catch((error: ClientError) => {
        const message = `[slice/push] Slice ${modelWithScreenshots.name}: Unexpected error: ${error.message}`;
        console.log(message);

        return onError(
          `[slice/push] An unexpected error occurred while pushing the slice ${modelWithScreenshots.name}`,
          error.status
        );
      });
  } catch (e) {
    console.log(e);
    return onError(
      "[slice/push] An unexpected error occurred while pushing slice"
    );
  }
};

export default handler;
