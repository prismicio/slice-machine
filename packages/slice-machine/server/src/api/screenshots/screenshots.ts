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
  previewUrl: string | undefined
) {
  if (!previewIsSupported(framework)) {
    const reason = "Could not generate preview: framework is not supported";

    return {
      err: new Error(reason),
      reason,
      screenshots: {},
    };
  }
  if (!previewUrl) {
    const reason =
      "Could not generate screenshots: localSlicePreviewURL undefined in sm.json file";

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

  const maybeErr = validateEnv(
    env.framework,
    env.manifest.localSliceSimulatorURL
  );
  if (maybeErr) {
    return maybeErr;
  }

  const { screenshots, failure } = await generateScreenshotAndRemoveCustom(
    env,
    libraryName,
    sliceName
  );

  if (failure.length > 0) {
    const message:
      | string
      | null = `Could not generate screenshots for variations: ${failure
      .map((f) => f.variationId)
      .join(" | ")}`;

    /* We display an error if no screenshot has been taken */
    const isError = Object.keys(screenshots).length === 0;

    return {
      err: isError ? new Error(message) : null,
      reason: isError ? message : null,
      warning: isError ? null : message,
      screenshots,
    };
  }

  return {
    err: null,
    reason: null,
    screenshots,
  };
}
