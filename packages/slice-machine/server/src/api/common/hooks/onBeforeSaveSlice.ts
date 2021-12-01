import type { Models } from "@slicemachine/models";
import Environment from "@lib/models/common/Environment";

import { GeneratedPaths } from "@lib/models/paths";

import Files from "@lib/utils/files";

export default async function onBeforeSaveSlice(
  {
    from,
    sliceName,
  }: { from: string; sliceName: string; model: Models.SliceAsObject },
  env: Environment
): Promise<void> {
  const pathToSliceAssets = GeneratedPaths(env.cwd)
    .library(from)
    .slice(sliceName)
    .value();
  Files.flushDirectories(pathToSliceAssets);
}
