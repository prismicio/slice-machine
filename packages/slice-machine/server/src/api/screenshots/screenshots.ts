import type Models from "@slicemachine/core/build/src/models";
import getEnv from "../services/getEnv";
import { generateScreenshotAndRemoveCustom } from "./generate";

interface ScreenshotBody {
  libraryName: string;
  sliceName: string;
}

interface ScreenshotResponse {
  err: Error | null;
  reason: string | null;
  screenshots: Record<string, Models.Screenshot>;
}

export default async function handler({
  libraryName,
  sliceName,
}: ScreenshotBody): Promise<ScreenshotResponse> {
  const { env } = await getEnv();
  if (!env.manifest.localSliceCanvasURL) {
    const reason =
      "Could not generate preview: localSliceCanvasUrl undefined in sm.json file";

    return {
      err: new Error(reason),
      reason,
      screenshots: {},
    };
  }

  const { screenshots, failure } = await generateScreenshotAndRemoveCustom(
    env,
    libraryName,
    sliceName
  );

  const message: string | null = failure.length
    ? `Could not generate previews for variations: ${failure
        .map((f) => f.variationId)
        .join(" | ")}`
    : null;

  return {
    err: message ? new Error(message) : null,
    reason: message,
    screenshots,
  };
}
