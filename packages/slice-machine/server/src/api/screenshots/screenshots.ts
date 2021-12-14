import getEnv from "../services/getEnv";
import { generateScreenshotAndRemoveCustom } from "./generate";
import {
  ScreenshotRequest,
  ScreenshotResponse,
} from "@models/common/Screenshots";

export default async function handler({
  libraryName,
  sliceName,
}: ScreenshotRequest): Promise<ScreenshotResponse> {
  const { env } = await getEnv();
  if (!env.manifest.localSliceCanvasURL) {
    const reason =
      "Could not generate screenshots: localSliceCanvasUrl undefined in sm.json file";

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
    ? `Could not generate screenshots for variations: ${failure
        .map((f) => f.variationId)
        .join(" | ")}`
    : null;

  return {
    err: message ? new Error(message) : null,
    reason: message,
    screenshots,
  };
}
