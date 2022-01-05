const fs = require("fs");
const path = require("path");
const glob = require("glob");
const slash = require("slash");
const {
  CustomPaths,
  GeneratedPaths,
} = require("../../../build/lib/models/paths");
const { default: Files } = require("../../../build/lib/utils/files");
const {
  getInfoFromPath,
} = require("@slicemachine/core/build/src/libraries/path");
const {
  SupportedFrameworks,
} = require("@slicemachine/core/build/src/models/Framework");
const {
  detectFramework,
} = require("@slicemachine/core/build/src/utils/framework");
const {
  default: storybook,
} = require("../../../build/server/src/api/storybook");

function scopePreviewToDefaultVariation(cwd, libraryName, sliceName) {
  const slicePath = GeneratedPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .value();
  const generatedSlicePreview = Files.readFirstOf([
    path.join(slicePath, "preview.png"),
    path.join(slicePath, "preview.jpg"),
  ])((v) => v);
  if (!generatedSlicePreview) return;

  const dirname = path.dirname(generatedSlicePreview.path);
  const fileName = path.basename(generatedSlicePreview.path);

  const generatedVariationPreviewPath = path.join(
    dirname,
    "default-slice",
    fileName
  );

  Files.mkdir(path.dirname(generatedVariationPreviewPath), { recursive: true });
  fs.renameSync(generatedSlicePreview.path, generatedVariationPreviewPath);
}

function moveMocks(cwd, libraryName, sliceName) {
  const customMocksPath = CustomPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .mocks();

  const customMocks =
    Files.exists(customMocksPath) && Files.readString(customMocksPath);
  if (!customMocks) return;

  const generatedMocksPath = GeneratedPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .mocks();

  Files.write(generatedMocksPath, customMocks);
  Files.remove(customMocksPath);
}

function moveStories(cwd, libraryName, sliceName) {
  const customStoriesPath = CustomPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .stories();
  const customStories =
    Files.exists(customStoriesPath) && Files.readString(customStoriesPath);
  if (!customStories) return;

  Files.remove(customStoriesPath);
  storybook.generateStories(
    path.join(__dirname, "../../../"),
    detectFramework(cwd, SupportedFrameworks),
    cwd,
    libraryName,
    sliceName
  );
}

function migrateSlice(cwd, libraryName, sliceName) {
  scopePreviewToDefaultVariation(cwd, libraryName, sliceName);
  moveMocks(cwd, libraryName, sliceName);
  moveStories(cwd, libraryName, sliceName);
}

module.exports = {
  version: "0.1.0",
  main: async function main(ignorePrompt, { cwd, pathToSmFile }) {
    const pathToOldMocks = path.join(cwd, ".slicemachine", "mocks.json");
    if (Files.exists(pathToOldMocks)) {
      Files.remove(pathToOldMocks);
    }
    if (Files.exists(pathToSmFile)) {
      const json = JSON.parse(fs.readFileSync(pathToSmFile, "utf-8"));
      (json.libraries || []).forEach((lib) => {
        const { isLocal, pathExists, pathToSlices, pathToLib } =
          getInfoFromPath(cwd, lib);
        if (isLocal && pathExists) {
          const libraryName = path.basename(pathToLib);
          const sliceNames = Files.readDirectory(slash(pathToSlices))
            .map((curr) => path.join(pathToSlices, curr))
            .filter((e) => fs.statSync(e).isDirectory())
            .map((slicePath) => path.basename(slicePath));

          sliceNames.forEach((sliceName) => {
            migrateSlice(cwd, libraryName, sliceName);
          });
        }
      });
    }
    console.info("\nSliceMachine nows supports variations!");
    console.info(
      "Generated mocks and Stories are now stored in the .slicemachine folder."
    );
  },
};
