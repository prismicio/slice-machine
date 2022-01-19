// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const slash = require("slash");
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const {
  CustomPaths,
  GeneratedPaths,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("../../../build/lib/models/paths");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const { default: Files } = require("../../../build/lib/utils/files");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const { getInfoFromPath } = require("@slicemachine/core/build/src/utils/lib");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const {
  SupportedFrameworks,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("@slicemachine/core/build/src/models/Framework");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
} = require("@slicemachine/core/build/src/utils/framework");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
} = require("../../../build/server/src/api/storybook");

function scopePreviewToDefaultVariation(cwd, libraryName, sliceName) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-var-requires, @typescript-eslint/no-var-requires, @typescript-eslint/no-var-requires, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
  const slicePath = GeneratedPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .value();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const generatedSlicePreview = Files.readFirstOf([
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    path.join(slicePath, "preview.png"),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    path.join(slicePath, "preview.jpg"),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  ])((v) => v);
  if (!generatedSlicePreview) return;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  const dirname = path.dirname(generatedSlicePreview.path);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  const fileName = path.basename(generatedSlicePreview.path);

  const generatedVariationPreviewPath = path.join(
    dirname,
    "default-slice",
    fileName
  );

  Files.mkdir(path.dirname(generatedVariationPreviewPath), { recursive: true });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  fs.renameSync(generatedSlicePreview.path, generatedVariationPreviewPath);
}

function moveMocks(cwd, libraryName, sliceName) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const customMocksPath = CustomPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .mocks();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
  const customMocks =
    Files.exists(customMocksPath) && Files.readString(customMocksPath);
  if (!customMocks) return;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const generatedMocksPath = GeneratedPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .mocks();

  Files.write(generatedMocksPath, customMocks);
  Files.remove(customMocksPath);
}

function moveStories(cwd, libraryName, sliceName) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const customStoriesPath = CustomPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .stories();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const customStories =
    Files.exists(customStoriesPath) && Files.readString(customStoriesPath);
  if (!customStories) return;

  Files.remove(customStoriesPath);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  storybook.generateStories(
    path.join(__dirname, "../../../"),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
  // eslint-disable-next-line @typescript-eslint/require-await
  main: async function main(ignorePrompt, { cwd, pathToSmFile }) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const pathToOldMocks = path.join(cwd, ".slicemachine", "mocks.json");
    if (Files.exists(pathToOldMocks)) {
      Files.remove(pathToOldMocks);
    }
    if (Files.exists(pathToSmFile)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
      const json = JSON.parse(fs.readFileSync(pathToSmFile, "utf-8"));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (json.libraries || []).forEach((lib) => {
        const { isLocal, pathExists, pathToSlices, pathToLib } =
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-argument
          getInfoFromPath(cwd, lib);
        if (isLocal && pathExists) {
          const libraryName = path.basename(pathToLib);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          const sliceNames = Files.readDirectory(slash(pathToSlices))
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            .map((curr) => path.join(pathToSlices, curr))
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            .filter((e) => fs.statSync(e).isDirectory())
            // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unsafe-argument
            .map((slicePath) => path.basename(slicePath));
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
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
