import { FileSystem, Utils } from "@slicemachine/core";
import { simulatorIsSupported } from "@lib/utils";
import { RequestWithEnv } from "./http/common";
import { Frameworks } from "@slicemachine/core/build/src/models/Framework";
import { SimulatorCheckResponse } from "@models/common/Simulator";

function requiredDepsForFramework(framework: Frameworks): Array<string> {
  const previousNext = [
    Utils.CONSTS.PREVIOUS_REACT_PACKAGE_NAME,
    Utils.CONSTS.NEXT_SLICEZONE,
    Utils.CONSTS.SLICE_SIMULATOR_REACT,
  ];

  const next = [
    Utils.CONSTS.PRISMIC_REACT_PACKAGE_NAME,
    Utils.CONSTS.SLICE_SIMULATOR_REACT,
    Utils.CONSTS.PRISMIC_HELPERS,
  ];

  const vue = [
    Utils.CONSTS.SLICE_SIMULATOR_VUE,
    Utils.CONSTS.NUXT_SM,
    Utils.CONSTS.VUE_SLICEZONE,
    Utils.CONSTS.NUXT_PRISMIC,
  ];

  if (framework === Frameworks.next) return next;
  if (framework === Frameworks.previousNext) return previousNext;
  if (framework === Frameworks.vue) return vue;

  return [];
}

// eslint-disable-next-line @typescript-eslint/require-await
export default async function handler(
  req: RequestWithEnv
): Promise<SimulatorCheckResponse> {
  const cwd = process.env.CWD || process.cwd();
  const response: SimulatorCheckResponse = {
    manifest: "ok",
    dependencies: "ok",
  };

  if (!simulatorIsSupported(req.env.framework)) {
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { dependencies, devDependencies } = packageJson.content;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const deps: Record<string, string> = { ...dependencies, ...devDependencies };

  const requiredDeps = requiredDepsForFramework(req.env.framework);

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
