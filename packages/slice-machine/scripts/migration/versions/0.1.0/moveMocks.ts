import * as NodeUtils from "@slicemachine/core/build/node-utils";

export function moveMocks(cwd: string, libraryName: string, sliceName: string) {
  const customMocksPath = NodeUtils.CustomPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .mocks();

  const customMocks =
    NodeUtils.Files.exists(customMocksPath) &&
    NodeUtils.Files.readString(customMocksPath);
  if (!customMocks) return;

  const generatedMocksPath = NodeUtils.GeneratedPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .mocks();

  // write the new file
  NodeUtils.Files.write(generatedMocksPath, customMocks);

  // remove the old one
  NodeUtils.Files.remove(customMocksPath);
}
