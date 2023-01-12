import path from "path";
import * as NodeUtils from "@slicemachine/core/build/node-utils";
import * as IO from "../../../../lib/io";
import storybook from "../../../../lib/storybook";

export function moveStories(
  cwd: string,
  libraryName: string,
  sliceName: string
) {
  const modelPath = NodeUtils.CustomPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .model();
  const model = IO.Slice.readSlice(modelPath);
  const customStoriesPath = NodeUtils.CustomPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .stories();

  const customStories =
    NodeUtils.Files.exists(customStoriesPath) &&
    NodeUtils.Files.readString(customStoriesPath);
  if (!customStories) return;

  // create the new story
  storybook.generateStories(
    path.join(__dirname, "../../../"),
    NodeUtils.Framework.defineFramework({ cwd }),
    cwd,
    libraryName,
    sliceName,
    model
  );

  // remove old stories
  NodeUtils.Files.remove(customStoriesPath);
}
