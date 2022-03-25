import path from "path";
import fs from "fs";
import * as NodeUtils from "@slicemachine/core/build/node-utils";

// Move the screenshot to the default variation folder
export function scopePreviewToDefaultVariation(
  cwd: string,
  libraryName: string,
  sliceName: string
) {
  const slicePath = NodeUtils.GeneratedPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .value();

  const generatedSlicePreview = NodeUtils.Files.readFirstOf([
    path.join(slicePath, "preview.png"),
    path.join(slicePath, "preview.jpg"),
  ])((v) => v);
  if (!generatedSlicePreview) return;

  const dirname = path.dirname(generatedSlicePreview.path);
  const fileName = path.basename(generatedSlicePreview.path);

  const generatedVariationPreviewPath = path.join(dirname, "default", fileName);

  NodeUtils.Files.mkdir(path.dirname(generatedVariationPreviewPath), {
    recursive: true,
  });
  fs.renameSync(generatedSlicePreview.path, generatedVariationPreviewPath);
}
