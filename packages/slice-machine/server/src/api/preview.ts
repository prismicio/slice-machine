import { FileSystem, Utils } from "@slicemachine/core";
import { previewIsSupported } from "@lib/utils";
import { RequestWithEnv } from "./http/common";
import { Frameworks } from "@slicemachine/core/build/src/models/Framework";

enum PreviewCheckError {
  FRAMEWORK_NOT_SUPPORTED = "The framework doesn't support the preview",
  MANIFEST_NOT_CONFIGURED = "The manifest is not configured",
  DEPENDENCIES_MISSING = "Some required dependencies are missing",
}

type PreviewCheckResponse = {
  err?: PreviewCheckError;
};

export default async function handler(
  req: RequestWithEnv
): Promise<PreviewCheckResponse> {
  const cwd = process.env.CWD || process.cwd();

  if (!previewIsSupported(req.env.framework)) {
    return {
      err: PreviewCheckError.FRAMEWORK_NOT_SUPPORTED,
    };
  }

  if (!req.env.manifest.localSliceCanvasURL) {
    return {
      err: PreviewCheckError.MANIFEST_NOT_CONFIGURED,
    };
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
          Utils.CONSTS.SLICE_CANVAS_REACT,
          Utils.CONSTS.NEXT_SLICEZONE,
          Utils.CONSTS.PRISMIC_REACT_PACKAGE_NAME,
        ]
      : [
          Utils.CONSTS.SLICE_CANVAS_VUE,
          Utils.CONSTS.NUXT_SM,
          Utils.CONSTS.NUXT_PRISMIC,
        ];

  Object.keys(deps).forEach((dep: string) => {
    const depIndex = requiredDeps.indexOf(dep);
    if (-1 !== depIndex) {
      requiredDeps.splice(depIndex, 1);
    }
  });

  if (requiredDeps.length !== 0) {
    return {
      err: PreviewCheckError.DEPENDENCIES_MISSING,
    };
  }

  return {};
}
