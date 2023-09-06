import { toast } from "react-toastify";

import { managerClient } from "@src/managerClient";
import { telemetry } from "@src/apiClient";

type CreateSlicesTemplatesArgs = {
  templateIDs: string[];
  localLibrariesNames: string[];
  onSuccess: (slicesIds: string[]) => Promise<void>;
};

export async function createSlicesTemplates(args: CreateSlicesTemplatesArgs) {
  try {
    const { templateIDs, localLibrariesNames, onSuccess } = args;

    const { data, errors } =
      await managerClient.sliceTemplateLibrary.createSlices({
        templateIDs,
      });

    if (errors.length > 0 || data === undefined) {
      throw errors;
    }

    data.sliceIDs.forEach((sliceID, index) => {
      void telemetry.track({
        event: "slice:created",
        id: sliceID,
        name: sliceID,
        library: localLibrariesNames[0],
        sliceTemplate: templateIDs[index],
      });
    });

    await onSuccess(data.sliceIDs);
  } catch (e) {
    const errorMessage = "Internal Error: Slice(s) not created";
    console.error(errorMessage, e);
    toast.error(errorMessage);
  }
}
