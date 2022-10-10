import { PRISMIC_TYPES } from "@slicemachine/core/build/consts";
import {
  retrieveManifest,
  retrieveJsonPackage,
} from "@slicemachine/core/build/node-utils";
import { logger } from "../../lib/utils/logger";
import { getFromPackage } from "../../lib/io/Types";

type ValidateGenerateTypesParams = {
  cwd: string;
};

export const validateGenerateTypes = ({ cwd }: ValidateGenerateTypesParams) => {
  const manifest = retrieveManifest(cwd);

  const packageJson = retrieveJsonPackage(cwd);
  const dependencies = getFromPackage("dependencies", packageJson.content);
  const devDependencies = getFromPackage(
    "devDependencies",
    packageJson.content
  );
  const allDependencies = {
    ...dependencies,
    ...devDependencies,
  };
  const hasTypesPackage = PRISMIC_TYPES in allDependencies;

  if (manifest.content && "generateTypes" in manifest.content) {
    // `generateTypes` is in manifest

    if (manifest.content.generateTypes && !hasTypesPackage) {
      logger.warn(
        "Slice Machine was configured to generate TypeScript types via the `generateTypes` option in `sm.json`, but the `@prismicio/types` package is missing.\nInstall `@prismicio/types` to generate TypeScript types."
      );
    }
  } else {
    // `generateTypes` is not in manifest

    if (!hasTypesPackage) {
      logger.info(
        'Install the `@prismicio/types` package to generate TypeScript types for your Prismic content.\nTo slience this message, add { "generateTypes": false } to `sm.json`.'
      );
    }
  }
};
