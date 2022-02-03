import { Utils, FileSystem } from "@slicemachine/core";

export function moveMocks(cwd: string, libraryName: string, sliceName: string) {
  const customMocksPath = FileSystem.CustomPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .mocks();

  const customMocks =
    Utils.Files.exists(customMocksPath) &&
    Utils.Files.readString(customMocksPath);
  if (!customMocks) return;

  const generatedMocksPath = FileSystem.GeneratedPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .mocks();

  // write the new file
  Utils.Files.write(generatedMocksPath, customMocks);

  // remove the old one
  Utils.Files.remove(customMocksPath);
}
