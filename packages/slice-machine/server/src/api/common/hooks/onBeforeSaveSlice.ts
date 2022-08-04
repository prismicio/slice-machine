import { BackendEnvironment } from "../../../../../lib/models/common/Environment";
import { GeneratedPaths } from "../../../../../lib/models/paths";
import Files from "../../../../../lib/utils/files";

export default function onBeforeSaveSlice(
  { from, sliceName }: { from: string; sliceName: string },
  env: BackendEnvironment
) {
  const pathToSliceAssetMocks = GeneratedPaths(env.cwd)
    .library(from)
    .slice(sliceName)
    .mocks();
  Files.remove(pathToSliceAssetMocks);
}
