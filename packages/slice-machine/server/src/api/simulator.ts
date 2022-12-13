import { simulatorIsSupported } from "../../../lib/utils";
import { RequestWithEnv } from "./http/common";
import { SimulatorCheckResponse } from "../../../lib/models/common/Simulator";

// eslint-disable-next-line @typescript-eslint/require-await
export default async function handler(
  req: RequestWithEnv
): Promise<SimulatorCheckResponse> {
  try {
    if (!simulatorIsSupported(req.env.framework)) {
      const message =
        "[api/env]: Unrecoverable error. The framework doesn't support the preview. Exiting..";
      console.error(message);
      throw new Error(message);
    }
    return {
      manifest: req.env.manifest.localSliceSimulatorURL ? "ok" : "ko",
      value: req.env.manifest.localSliceSimulatorURL,
    };
  } catch (e) {
    return {
      manifest: "ko",
      value: undefined,
    };
  }
}
