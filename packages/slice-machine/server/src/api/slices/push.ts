import type Models from "@slicemachine/core/build/src/models";

import getEnv from "../services/getEnv";
import { getSlices } from "./";
import Files from "@lib/utils/files";

import { onError } from "../common/error";
import { purge } from "../services/uploadScreenshotClient";
import { CustomPaths } from "@lib/models/paths";
import { BackendEnvironment } from "@lib/models/common/Environment";
import { SliceBody } from "@models/common/Slice";
import { uploadScreenshots, createOrUpdate } from "../services/sliceService";

export async function pushSlice(
  env: BackendEnvironment,
  slices: ReadonlyArray<Models.SliceAsObject>,
  { sliceName, from }: { sliceName: string; from: string }
) {
  const modelPath = CustomPaths(env.cwd).library(from).slice(sliceName).model();

  try {
    const jsonModel: Models.SliceAsObject =
      Files.readJson<Models.SliceAsObject>(modelPath);
    const { err }: { err?: ReturnType<typeof onError> } = await purge(
      env,
      slices,
      sliceName
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return
    if (err) return err;

    const imageUrlsByVariation: Record<string, string | null> =
      await uploadScreenshots(env, jsonModel, sliceName, from);

    console.log("[slice/push]: pushing slice model to Prismic");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const variations = jsonModel.variations.map(
      (v: Models.VariationAsObject) => ({
        ...v,
        imageUrl: imageUrlsByVariation[v.id],
      })
    );

    const modelWithImageUrl = {
      ...jsonModel,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      variations,
    };

    const res = await createOrUpdate(
      slices,
      sliceName,
      // This type is wrong because there is the property imageUrl inside it.
      modelWithImageUrl as Models.SliceAsObject,
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

const handler = async (
  query: SliceBody
): Promise<ReturnType<typeof onError> | Record<string, never>> => {
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
