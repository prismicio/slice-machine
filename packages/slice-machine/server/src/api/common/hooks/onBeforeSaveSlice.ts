import { BackendEnvironment } from "@lib/models/common/Environment";
import { GeneratedPaths } from "@lib/models/paths";
import Files from "@lib/utils/files";

// eslint-disable-next-line @typescript-eslint/require-await
export default async function onBeforeSaveSlice(
  { from, sliceName }: { from: string; sliceName: string },
  env: BackendEnvironment
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const pathToSliceAssets = GeneratedPaths(env.cwd)
    .library(from)
    .slice(sliceName)
    .value();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  Files.flushDirectories(pathToSliceAssets);
}
