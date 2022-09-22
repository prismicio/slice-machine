import getEnv from "../services/getEnv";
import { generateScreenshot } from "./generate";
import {
  ScreenshotRequest,
  ScreenshotResponse,
} from "../../../../lib/models/common/Screenshots";
import { simulatorIsSupported } from "../../../../lib/utils";
import { Frameworks } from "@slicemachine/core/build/models";

export function validateEnv(
  framework: Frameworks,
  simulatorUrl: string | undefined
) {
  if (!simulatorIsSupported(framework)) {
    const reason = "Could not generate preview: framework is not supported";

    return {
      err: new Error(reason),
      reason,
      screenshots: {},
    };
  }
  if (!simulatorUrl) {
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
  variationId,
}: ScreenshotRequest): Promise<ScreenshotResponse> {
  const { env } = await getEnv();

  const maybeErr = validateEnv(
    env.framework,
    env.manifest.localSliceSimulatorURL
  );
  if (maybeErr) {
    return maybeErr;
  }

  try {
    const { screenshots, failure } = await generateScreenshot(
      env,
      libraryName,
      sliceName,
      variationId
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
  } catch (e) {
    const crashMessage =
      "Could not generate screenshots for this slice, upload manually a screenshot";
    return {
      err: new Error(crashMessage),
      reason: crashMessage,
      warning: null,
      screenshots: {},
    };
  }
}
