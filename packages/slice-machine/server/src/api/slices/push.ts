import { getSlices } from ".";

import { purge } from "../services/uploadScreenshotClient";
import { CustomPaths } from "../../../../lib/models/paths";
import { uploadScreenshots } from "../services/sliceService";
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

export const handler = async (
  req: RequestWithEnv
): Promise<{ statusCode: number }> => {
  const { sliceName, from } = req.query;
  if (typeof sliceName != "string" || typeof from != "string")
    return { statusCode: 418 }; // Should never happen

  // Path to the local model of the slice
  const modelPath = CustomPaths(req.env.cwd)
    .library(from)
    .slice(sliceName)
    .model();

  try {
    const smModel: SliceSM = IO.Slice.readSlice(modelPath);

    // Fetching remote Slices
    const { slices: remoteSlices, err: FetchRemoteSlicesError } =
      await getSlices(req.env.client);

    // fetching error to be returned immediatly
    if (FetchRemoteSlicesError) {
      if (FetchRemoteSlicesError.status === 401)
        console.error(
          `[slice/push] Could not fetch remote slices, you don\'t have access to the repository \"${req.env.repo}\"`
        );

      if (![400, 401, 403].includes(FetchRemoteSlicesError.status))
        console.error(
          `[slice/push] Could not fetch remote slices. Unexpected error: ${FetchRemoteSlicesError.message}`
        );

      return { statusCode: FetchRemoteSlicesError.status };
    }

    // finding the remote model of the Slice we are pushing
    const remoteSlice = remoteSlices.find((slice) => slice.id === smModel.id);

    // removing existing screenshots that have been previously uploaded
    if (remoteSlice) {
      const { err: purgeError } = await purge(req.env, smModel.id);
      if (purgeError) {
        console.error(
          `[slice/push]: Unexpected error while removing previously uploaded screenshots: ${purgeError.reason}`
        );
        return { statusCode: purgeError.status };
      }
    }

    // Uploading screenshots for all variations of the slice
    const screenshotUrlsByVariation: Record<string, string | null> =
      await uploadScreenshots(req.env, smModel, sliceName, from);

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

    // Pushing the slice
    return createOrUpdate(req.env.client, modelWithScreenshots, remoteSlice)
      .then(() => {
        console.log(`[slice/push] Slice ${sliceName} pushed successfully !`);
        return { statusCode: 200 };
      })
      .catch((error: ClientError) => {
        console.error(
          `[slice/push] Unexpected error while pushing the Slice ${sliceName}: ${error.message}`
        );
        return { statusCode: error.status };
      });
  } catch (e) {
    console.error(
      `[slice/push] Unexpected error while pushing the Slice ${sliceName}: ${
        e as string
      }`
    );
    return { statusCode: 500 };
  }
};
