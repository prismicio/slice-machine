import * as NodeUtils from "@slicemachine/core/build/node-utils";

export function moveMocks(cwd: string, libraryName: string, sliceName: string) {
  const customMocksPath = NodeUtils.sliceMockPath(cwd, libraryName, sliceName);

  const customMocks =
    NodeUtils.Files.exists(customMocksPath) &&
    NodeUtils.Files.readString(customMocksPath);
  if (!customMocks) return;

  const generatedMocksPath = NodeUtils.sliceMockPath(
    cwd,
    libraryName,
    sliceName
  );

  // write the new file
  NodeUtils.Files.write(generatedMocksPath, customMocks);

  // remove the old one
  NodeUtils.Files.remove(customMocksPath);
}
