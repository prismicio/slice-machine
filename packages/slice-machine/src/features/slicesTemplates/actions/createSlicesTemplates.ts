import { toast } from "react-toastify";

import { managerClient } from "@/managerClient";

type CreateSlicesTemplatesArgs = {
  templateIDs: string[];
  localLibrariesNames: string[];
  onSuccess: (slicesIds: string[]) => Promise<void>;
};

export async function createSlicesTemplates(args: CreateSlicesTemplatesArgs) {
  try {
    const { templateIDs, onSuccess } = args;

    const { data, errors } =
      await managerClient.sliceTemplateLibrary.createSlices({
        templateIDs,
      });

    if (errors.length > 0 || data === undefined) {
      throw errors;
    }

    await onSuccess(data.sliceIDs);
  } catch (e) {
    const errorMessage = "Internal Error: Slice(s) not created";
    console.error(errorMessage, e);
    toast.error(errorMessage);
  }
}
