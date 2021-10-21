import { CustomPaths, GeneratedPaths } from "../filesystem/paths";
import Files from "../utils/files";

import { ACCEPTED_IMAGE_TYPES } from '../utils/const'

export function getPathToScreenshot({
  cwd,
  from,
  sliceName,
  variationId,
}: {
  cwd: string;
  from: string;
  sliceName: string;
  variationId: string;
}): { exists: boolean; path: string; isCustom: boolean } | undefined {
  const customPaths = ACCEPTED_IMAGE_TYPES.map((imageType: string) => {
    const previewPath = CustomPaths(cwd)
      .library(from)
      .slice(sliceName)
      .variation(variationId)
      .preview(`preview.${imageType}`);

    return {
      path: previewPath,
      options: {
        exists: true,
        isCustom: true,
      },
    };
  });

  const defaultPath = {
    path: GeneratedPaths(cwd)
      .library(from)
      .slice(sliceName)
      .variation(variationId)
      .preview(),
    options: {
      exists: true,
      isCustom: false,
    },
  };

  return Files.readFirstOf<string, { exists: boolean; isCustom: boolean }>(
    customPaths.concat([defaultPath])
  )((v: string) => v);
}
