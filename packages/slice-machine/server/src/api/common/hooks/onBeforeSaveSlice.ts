import { BackendEnvironment } from "../../../../../lib/models/common/Environment";
import { sliceMockPath } from "@prismic-beta/slicemachine-core/build/node-utils/paths";
import Files from "../../../../../lib/utils/files";

export default function onBeforeSaveSlice(
  { from, sliceName }: { from: string; sliceName: string },
  env: BackendEnvironment
) {
  const pathToSliceAssetMocks = sliceMockPath(env.cwd, from, sliceName);
  Files.remove(pathToSliceAssetMocks);
}
