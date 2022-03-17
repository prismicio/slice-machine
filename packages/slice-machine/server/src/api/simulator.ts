import { CONSTS, NodeUtils } from "@slicemachine/core";
import { simulatorIsSupported } from "@lib/utils";
import { RequestWithEnv } from "./http/common";
import { Frameworks } from "@slicemachine/core/build/models/Framework";
import { SimulatorCheckResponse } from "@models/common/Simulator";

const {
  PREVIOUS_REACT_PACKAGE_NAME,
  NEXT_SLICEZONE,
  SLICE_SIMULATOR_REACT,
  PRISMIC_REACT_PACKAGE_NAME,
  PRISMIC_HELPERS,
  SLICE_SIMULATOR_VUE,
  NUXT_PRISMIC,
  NUXT_SM,
  VUE_SLICEZONE,
} = CONSTS;

function requiredDepsForFramework(framework: Frameworks): Array<string> {
  const previousNext = [
    PREVIOUS_REACT_PACKAGE_NAME,
    NEXT_SLICEZONE,
    SLICE_SIMULATOR_REACT,
  ];

  const next = [
    PRISMIC_REACT_PACKAGE_NAME,
    SLICE_SIMULATOR_REACT,
    PRISMIC_HELPERS,
  ];

  const nuxt = [SLICE_SIMULATOR_VUE, NUXT_PRISMIC];

  const previousNuxt = [
    SLICE_SIMULATOR_VUE,
    NUXT_SM,
    VUE_SLICEZONE,
    NUXT_PRISMIC,
  ];

  if (framework === Frameworks.next) return next;
  if (framework === Frameworks.previousNext) return previousNext;
  if (framework === Frameworks.nuxt) return nuxt;
  if (framework === Frameworks.previousNuxt) return previousNuxt;

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

  const packageJson = NodeUtils.retrieveJsonPackage(cwd);

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
