import { useRequest } from "@prismicio/editor-support/Suspense";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { managerClient } from "@src/managerClient";

export type SliceTemplate = {
  model: SharedSlice;
  screenshots: Record<string, string>;
};

async function getSlicesTemplates(): Promise<SliceTemplate[]> {
  try {
    const { templates, errors } =
      await managerClient.sliceTemplateLibrary.readLibrary({});

    if (errors.length > 0) {
      throw errors;
    }

    return templates.map((template) => ({
      model: template.model,
      screenshots: Object.fromEntries(
        Object.entries(template.screenshots).map(([key, blob]) => [
          key,
          URL.createObjectURL(blob),
        ])
      ),
    }));
  } catch (e) {
    return [];
  }
}

export function useSlicesTemplates() {
  const slicesTemplates = useRequest(getSlicesTemplates, []);

  return slicesTemplates;
}
