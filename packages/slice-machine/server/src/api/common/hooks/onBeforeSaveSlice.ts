/* eslint-disable */
import Environment from "@lib/models/common/Environment";
import Slice from "@lib/models/common/Slice";
import { AsObject } from "@lib/models/common/Variation";

import { GeneratedPaths } from "@lib/models/paths";

import Files from "@lib/utils/files";

export default async function onBeforeSaveSlice(
  {
    from,
    sliceName,
  }: { from: string; sliceName: string; model: Slice<AsObject> },
  env: Environment
): Promise<void> {
  const pathToSliceAssets = GeneratedPaths(env.cwd)
    .library(from)
    .slice(sliceName)
    .value();
  Files.flushDirectories(pathToSliceAssets);
}
