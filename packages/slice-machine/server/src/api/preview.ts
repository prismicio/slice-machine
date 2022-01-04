import { previewIsSupported } from "@lib/utils";
import { RequestWithEnv } from "./http/common";
import { Frameworks } from "@slicemachine/core/build/src/models/Framework";
import { PreviewCheckResponse } from "@models/common/Preview";

import * as CONSTS from "@slicemachine/core/build/src/defaults";
import { retrieveJsonPackage } from "@slicemachine/core/build/src/fs-utils";

export default async function handler(
  req: RequestWithEnv,
  log?: boolean
): Promise<PreviewCheckResponse> {
  const cwd = process.env.CWD || process.cwd();
  let response: PreviewCheckResponse = {
    manifest: "ok",
    dependencies: "ok",
  };

  if (!previewIsSupported(req.env.framework)) {
    if (log) console.log("1");
    const message =
      "[api/env]: Unrecoverable error. The framework doesn't support the preview. Exiting..";
    console.error(message);
    throw new Error(message);
  }

  if (!req.env.manifest.localSliceCanvasURL) {
    if (log) console.log("2");
    response.manifest = "ko";
  }
  const packageJson = retrieveJsonPackage(cwd);
  if (!packageJson.exists || !packageJson.content) {
    if (log) console.log("5");
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
          CONSTS.SLICE_CANVAS_REACT,
          CONSTS.NEXT_SLICEZONE,
          CONSTS.PRISMIC_REACT_PACKAGE_NAME,
        ]
      : [
          CONSTS.SLICE_CANVAS_VUE,
          CONSTS.NUXT_SM,
          CONSTS.VUE_SLICEZONE,
          CONSTS.NUXT_PRISMIC,
        ];

  if (log) {
    console.log({ deps, requiredDeps });
  }
  Object.keys(deps).forEach((dep: string) => {
    const depIndex = requiredDeps.indexOf(dep);
    if (-1 !== depIndex) {
      requiredDeps.splice(depIndex, 1);
    }
  });

  if (requiredDeps.length !== 0) {
    if (log) console.log("6");
    response.dependencies = "ko";
  }
  return response;
}
