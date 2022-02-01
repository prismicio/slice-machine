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
import { BackendEnvironment } from "@lib/models/common/Environment";
import { SliceBody } from "@models/common/Slice";

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
  env: BackendEnvironment,
  slices: ReadonlyArray<Models.SliceAsObject>,
  { sliceName, from }: { sliceName: string; from: string }
) {
  const modelPath = CustomPaths(env.cwd).library(from).slice(sliceName).model();

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
    const jsonModel = Files.readJson(modelPath);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { err } = await purge(env, slices, sliceName, onError);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return
    if (err) return err;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const variationIds = jsonModel.variations.map(
      (v: Models.VariationAsObject) => v.id
    );

    const imageUrlsByVariation: { [variationId: string]: string | null } = {};

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    for (let i = 0; i < variationIds.length; i += 1) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const variationId = variationIds[i];

      const screenshot = resolvePathsToScreenshot({
        paths: [env.cwd, path.join(env.cwd, ".slicemachine/assets")],
        from,
        sliceName,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        variationId,
      });

      if (screenshot) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { err, s3ImageUrl } = await upload(
          env,
          sliceName,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          variationId,
          screenshot.path,
          onError
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        if (err) throw new Error(err.reason);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        imageUrlsByVariation[variationId] = s3ImageUrl;
      } else {
        console.error(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/restrict-template-expressions
          `--- Unable to find a screenshot for slice ${sliceName} | variation ${variationId}`
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        imageUrlsByVariation[variationId] = null;
      }
    }

    console.log("[slice/push]: pushing slice model to Prismic");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const variations = jsonModel.variations.map(
      (v: Models.VariationAsObject) => ({
        ...v,
        imageUrl: imageUrlsByVariation[v.id],
      })
    );

    const res = await createOrUpdate({
      slices,
      sliceName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      model: {
        ...jsonModel,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

export default async function apiHandler(query: SliceBody) {
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
        : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `You don\'t have access to the repo \"${env.repo}\"`;

    return onError(
      err,
      `Error ${err.status}: Could not fetch remote slices. ${errorExplanation}`
    );
  }
  return handler(env, slices, { sliceName, from });
}
