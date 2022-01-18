import { FileSystem, Utils } from "@slicemachine/core";
import { previewIsSupported } from "@lib/utils";
import { RequestWithEnv } from "./http/common";
import { Frameworks } from "@slicemachine/core/build/src/models/Framework";
import { SimulatorCheckResponse } from "@models/common/Simulator";

export default async function handler(
  req: RequestWithEnv
): Promise<SimulatorCheckResponse> {
  const cwd = process.env.CWD || process.cwd();
  const response: SimulatorCheckResponse = {
    manifest: "ok",
    dependencies: "ok",
  };

  if (!previewIsSupported(req.env.framework)) {
    const message =
      "[api/env]: Unrecoverable error. The framework doesn't support the preview. Exiting..";
    console.error(message);
    throw new Error(message);
  }

  if (!req.env.manifest.localSliceSimulatorURL) {
    response.manifest = "ko";
  }

  const packageJson = FileSystem.retrieveJsonPackage(cwd);

  if (!packageJson.exists || !packageJson.content) {
    const message =
      "[api/env]: Unrecoverable error. Could not find package.json. Exiting..";
    console.error(message);
    throw new Error(message);
  }

  const { dependencies, devDependencies } = packageJson.content;
  const deps: Record<string, string> = { ...dependencies, ...devDependencies };

  const requiredDeps =
    req.env.framework === Frameworks.next
      ? [
          Utils.CONSTS.SLICE_SIMULATOR_REACT,
          Utils.CONSTS.NEXT_SLICEZONE,
          Utils.CONSTS.PRISMIC_REACT_PACKAGE_NAME,
        ]
      : [
          Utils.CONSTS.SLICE_SIMULATOR_VUE,
          Utils.CONSTS.NUXT_SM,
          Utils.CONSTS.VUE_SLICEZONE,
          Utils.CONSTS.NUXT_PRISMIC,
        ];

  Object.keys(deps).forEach((dep: string) => {
    const depIndex = requiredDeps.indexOf(dep);
    if (-1 !== depIndex) {
      requiredDeps.splice(depIndex, 1);
    }
  });

  if (requiredDeps.length !== 0) {
    response.dependencies = "ko";
  }

  return response;
}
