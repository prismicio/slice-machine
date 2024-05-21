import { toast } from "react-toastify";

import { generateSliceCustomScreenshot, telemetry } from "@/apiClient";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";

type UploadSliceScreenshotArgs = {
  file: File;
  method: "upload" | "dragAndDrop";
  slice: ComponentUI;
  variationId: string;
};

export async function uploadSliceScreenshot(args: UploadSliceScreenshotArgs) {
  const { variationId, slice, file, method } = args;

  try {
    const form = new FormData();
    form.append("file", file);
    form.append("libraryName", slice.from);
    form.append("sliceName", slice.model.name);
    form.append("variationId", variationId);
    const { errors, url } = await generateSliceCustomScreenshot({
      libraryName: slice.from,
      sliceId: slice.model.id,
      variationId,
      file,
    });

    if (errors.length > 0) {
      throw errors;
    }

    void telemetry.track({ event: "screenshot-taken", type: "custom", method });

    return {
      ...slice,
      screenshots: { ...slice.screenshots, [variationId]: { url } },
    };
  } catch (error) {
    const message = `Screenshot not saved`;
    console.error(message, error);

    toast.error(message);
  }
}
