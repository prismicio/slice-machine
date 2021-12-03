import path from "path";
import type Models from "@slicemachine/core/build/src/models";
import { snakelize } from "@lib/utils/str";

import getEnv from "../services/getEnv";
import { getSlices } from "./";
import Files from "@lib/utils/files";

import { resolvePathsToScreenshot } from "@slicemachine/core/build/src/libraries/screenshot";

import { onError } from "../common/error";
import { purge, upload } from "../upload";
import DefaultClient from "@lib/models/common/http/DefaultClient";
import FakeClient from "@lib/models/common/http/FakeClient";
import { CustomPaths } from "@lib/models/paths";
import Environment from "@lib/models/common/Environment";

const createOrUpdate = async ({
  slices,
  sliceName,
  model,
  client,
}: {
  slices: ReadonlyArray<Models.SliceAsObject>;
  sliceName: string;
  model: Models.SliceAsObject;
  client: DefaultClient | FakeClient;
}) => {
  if (slices.find((e) => e.id === snakelize(sliceName))) {
    return await client.updateSlice(model);
  } else {
    return await client.insertSlice(model);
  }
};

export async function handler(
  env: Environment,
  slices: ReadonlyArray<Models.SliceAsObject>,
  { sliceName, from }: { sliceName: string; from: string }
) {
  const modelPath = CustomPaths(env.cwd).library(from).slice(sliceName).model();

  try {
    const jsonModel = Files.readJson(modelPath);
    const { err } = await purge(env, slices, sliceName, onError);
    if (err) return err;

    const variationIds = jsonModel.variations.map(
      (v: Models.VariationAsObject) => v.id
    );

    const imageUrlsByVariation: { [variationId: string]: string | null } = {};

    for (let i = 0; i < variationIds.length; i += 1) {
      const variationId = variationIds[i];

      const screenshot = resolvePathsToScreenshot({
        paths: [env.cwd, path.join(env.cwd, ".slicemchine/assets")],
        from,
        sliceName,
        variationId,
      });

      if (screenshot) {
        const { err, s3ImageUrl } = await upload(
          env,
          sliceName,
          variationId,
          screenshot.path,
          onError
        );
        if (err) throw new Error(err.reason);
        imageUrlsByVariation[variationId] = s3ImageUrl;
      } else {
        console.error(
          `--- Unable to find a screenshot for slice ${sliceName} | variation ${variationId}`
        );
        imageUrlsByVariation[variationId] = null;
      }
    }

    console.log("[slice/push]: pushing slice model to Prismic");

    const variations = jsonModel.variations.map(
      (v: Models.VariationAsObject) => ({
        ...v,
        imageUrl: imageUrlsByVariation[v.id],
      })
    );

    const res = await createOrUpdate({
      slices,
      sliceName,
      model: {
        ...jsonModel,
        variations,
      },
      client: env.client,
    });
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
      "An unexpected error occurred while pushing slice"
    );
  }
}

export default async function apiHandler(query: {
  sliceName: string;
  from: string;
}) {
  const { sliceName, from } = query;
  const { env } = await getEnv();

  // When the user is not connected at all
  if (env.client.isFake()) {
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
        : `You don\'t have access to the repo \"${env.repo}\"`;

    return onError(
      err,
      `Error ${err.status}: Could not fetch remote slices. ${errorExplanation}`
    );
  }
  return handler(env, slices, { sliceName, from });
}
