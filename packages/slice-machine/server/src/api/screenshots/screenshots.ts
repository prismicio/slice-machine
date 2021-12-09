import type Models from "@slicemachine/core/build/src/models";
import getEnv from "../services/getEnv";
import { generateScreenshotAndRemoveCustom } from "./generate";

interface ScreenshotBody {
  from: string;
  sliceName: string;
}

interface ScreenshotResponse {
  err: Error | null;
  reason: string | null;
  previews: Record<string, Models.Screenshot>;
}

export default async function handler({
  from,
  sliceName,
}: ScreenshotBody): Promise<ScreenshotResponse> {
  console.log("TAKING REGULAR SCREENSHOT");
  const { env } = await getEnv();
  if (!env.manifest.localSliceCanvasURL) {
    const reason =
      "Could not generate preview: localSliceCanvasUrl undefined in sm.json file";

    return {
      err: new Error(reason),
      reason,
      previews: {},
    };
  }

  const { screenshots, failure } = await generateScreenshotAndRemoveCustom(
    env,
    from,
    sliceName
  );

  const message: string | null = failure.length
    ? `Could not generate previews for variations: ${failure
        .map((f) => f.variationId)
        .join(" | ")}`
    : null;

  console.log("DONE");

  return {
    err: message ? new Error(message) : null,
    reason: message,
    previews: screenshots,
  };
}
