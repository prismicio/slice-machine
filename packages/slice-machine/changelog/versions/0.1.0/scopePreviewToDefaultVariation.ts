import path from "path";
import fs from "fs";
import { Utils, FileSystem } from "@slicemachine/core";

// Move the screenshot to the default variation folder
export function scopePreviewToDefaultVariation(
  cwd: string,
  libraryName: string,
  sliceName: string
) {
  const slicePath = FileSystem.GeneratedPaths(cwd)
    .library(libraryName)
    .slice(sliceName)
    .value();

  const generatedSlicePreview = Utils.Files.readFirstOf([
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

  Utils.Files.mkdir(path.dirname(generatedVariationPreviewPath), {
    recursive: true,
  });
  fs.renameSync(generatedSlicePreview.path, generatedVariationPreviewPath);
}
