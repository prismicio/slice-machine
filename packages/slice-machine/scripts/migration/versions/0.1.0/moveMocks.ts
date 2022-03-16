import { Utils, NodeUtils } from "@slicemachine/core";

export function moveMocks(cwd: string, libraryName: string, sliceName: string) {
  const customMocksPath = NodeUtils.CustomPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .mocks();

  const customMocks =
    Utils.Files.exists(customMocksPath) &&
    Utils.Files.readString(customMocksPath);
  if (!customMocks) return;

  const generatedMocksPath = NodeUtils.GeneratedPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .mocks();

  // write the new file
  Utils.Files.write(generatedMocksPath, customMocks);

  // remove the old one
  Utils.Files.remove(customMocksPath);
}
