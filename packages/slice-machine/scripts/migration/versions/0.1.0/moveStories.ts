import path from "path";
import { Utils, FileSystem, NodeUtils } from "@slicemachine/core";

import storybook from "../../../../server/src/api/storybook";

export function moveStories(
  cwd: string,
  libraryName: string,
  sliceName: string
) {
  const customStoriesPath = FileSystem.CustomPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .stories();

  const customStories =
    Utils.Files.exists(customStoriesPath) &&
    Utils.Files.readString(customStoriesPath);
  if (!customStories) return;

  // create the new story
  storybook.generateStories(
    path.join(__dirname, "../../../"),
    NodeUtils.Framework.defineFramework({ cwd }),
    cwd,
    libraryName,
    sliceName
  );

  // remove old stories
  Utils.Files.remove(customStoriesPath);
}
