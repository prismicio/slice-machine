import getEnv from "../services/getEnv";
import { generateScreenshotAndRemoveCustom } from "./generate";
import {
  ScreenshotRequest,
  ScreenshotResponse,
} from "@models/common/Screenshots";
import { previewIsSupported } from "@lib/utils";
import { Frameworks } from "@slicemachine/core/build/src/models";

export function validateEnv(
  framework: Frameworks,
  canvasUrl: string | undefined
) {
  if (!previewIsSupported(framework)) {
    const reason = "Could not generate preview: framework is not supported";

    return {
      err: new Error(reason),
      reason,
      screenshots: {},
    };
  }
  if (!canvasUrl) {
    const reason =
      "Could not generate preview: localSliceCanvasUrl undefined in sm.json file";

    return {
      err: new Error(reason),
      reason,
      screenshots: {},
    };
  }
}

export default async function handler({
  libraryName,
  sliceName,
}: ScreenshotRequest): Promise<ScreenshotResponse> {
  const { env } = await getEnv();

  const maybeErr = validateEnv(env.framework, env.manifest.localSliceCanvasURL);
  if (maybeErr) {
    return maybeErr;
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
