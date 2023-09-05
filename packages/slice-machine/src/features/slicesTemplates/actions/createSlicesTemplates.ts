import { toast } from "react-toastify";

import { managerClient } from "@src/managerClient";
import { telemetry } from "@src/apiClient";

type CreateSlicesTemplatesArgs = {
  templateIds: string[];
  localLibrariesNames: string[];
  onSuccess: (slicesIds: string[]) => Promise<void>;
};

export async function createSlicesTemplates(args: CreateSlicesTemplatesArgs) {
  try {
    const { templateIds, localLibrariesNames, onSuccess } = args;

    const { data, errors } = await managerClient.sliceTemplateLibrary.create({
      templateIds,
    });

    if (errors.length > 0 || data === undefined) {
      throw errors;
    }

    templateIds.forEach((templateId) => {
      void telemetry.track({
        event: "slice:created",
        id: templateId,
        name: templateId,
        library: localLibrariesNames[0],
        sliceTemplate: templateId,
      });
    });

    await onSuccess(data.sliceIds);
  } catch (e) {
    const errorMessage = "Internal Error: Slice(s) not created";
    console.error(errorMessage, e);
    toast.error(errorMessage);
  }
}
