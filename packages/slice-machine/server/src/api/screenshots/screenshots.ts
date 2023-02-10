import * as Sentry from "@sentry/node";

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
    };
  }
  if (!simulatorUrl) {
    const reason =
      "Could not generate screenshots: localSlicePreviewURL undefined in sm.json file";

    return {
      err: new Error(reason),
      reason,
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

    return {
      screenshot,
    };
  } catch (error) {
    console.error(error);
    Sentry.captureException(error);
    return {
      err: error as Error,
      reason: "Could not generate screenshot",
    };
  }
}
