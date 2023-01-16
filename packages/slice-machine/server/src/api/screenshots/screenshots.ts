import getEnv from "../services/getEnv";
import { generateScreenshotAndRemoveCustom } from "./generate";
import {
  ScreenshotRequest,
  ScreenshotResponse,
} from "../../../../lib/models/common/Screenshots";
import { simulatorIsSupported } from "../../../../lib/utils";
import { Frameworks } from "@slicemachine/core/build/models";

export function validateEnv(
  framework: Frameworks,
  simulatorUrl: string | undefined
): ScreenshotResponse | undefined {
  if (!simulatorIsSupported(framework)) {
    const reason = "Could not generate preview: framework is not supported";

    return {
      err: new Error(reason),
      reason,
      screenshot: null,
    };
  }
  if (!simulatorUrl) {
    const reason =
      "Could not generate screenshots: localSlicePreviewURL undefined in sm.json file";

    return {
      err: new Error(reason),
      reason,
      screenshot: null,
    };
  }
}

export default async function handler({
  href,
  libraryName,
  sliceName,
  variationId,
  screenDimensions,
}: ScreenshotRequest): Promise<ScreenshotResponse> {
  const { env } = getEnv();

  const maybeErr = validateEnv(
    env.framework,
    env.manifest.localSliceSimulatorURL
  );
  if (maybeErr) {
    return maybeErr;
  }

  try {
    const { screenshot } = await generateScreenshotAndRemoveCustom(
      env,
      libraryName,
      sliceName,
      variationId,
      screenDimensions,
      href
    );

    // We display an error if no screenshot has been taken
    if (!screenshot) {
      const message = `Could not generate screenshot for variation ${variationId}`;
      return {
        err: new Error(message),
        reason: message,
        warning: null,
        screenshot,
      };
    }

    return {
      err: null,
      reason: null,
      screenshot,
    };
  } catch (e) {
    const crashMessage =
      "Could not generate screenshots for this slice, upload manually a screenshot";
    return {
      err: new Error(crashMessage),
      reason: crashMessage,
      warning: null,
      screenshot: null,
    };
  }
}
