import getEnv from "./services/getEnv";
import Files from "@lib/utils/files";

import {
  resolvePathsToScreenshot,
  createPathToScreenshot,
  Extensions,
} from "@slicemachine/core/build/src/libraries/screenshot";
import {
  createScreenshotUI,
  ScreenshotUI,
} from "@lib/models/common/ComponentUI";

export default async function handler(
  file: File & { path: string },
  {
    from,
    sliceName,
    variationId,
  }: { from: string; sliceName: string; variationId: string }
): Promise<ScreenshotUI> {
  const { env } = await getEnv();

  const maybeCustomScreenshot = resolvePathsToScreenshot({
    paths: [env.cwd],
    from,
    sliceName,
    variationId,
  });
  if (maybeCustomScreenshot) {
    Files.remove(maybeCustomScreenshot.path);
  }

  const pathToScreenshot = createPathToScreenshot({
    path: env.cwd,
    from,
    sliceName,
    variationId,
    extension: file.type.split("/")[1] as Extensions,
  });

  Files.copy(file.path, pathToScreenshot, { recursive: true });

  return createScreenshotUI(env.baseUrl, pathToScreenshot);
}
