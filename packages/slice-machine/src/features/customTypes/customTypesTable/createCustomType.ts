import type { CustomTypeSM, TabSM } from "@lib/models/common/CustomType";
import type { SlicesSM } from "@lib/models/common/Slices";
import type { CustomTypeFormat } from "@slicemachine/manager";

export function createCustomType(
  id: string,
  label: string,
  repeatable: boolean,
  format: CustomTypeFormat
): CustomTypeSM {
  const mainTab = makeMainTab(repeatable, format);

  const tabs: TabSM[] = [mainTab];

  if (format === "page") {
    tabs.push(DEFAULT_SEO_TAB);
  }

  return {
    id,
    label,
    format,
    repeatable,
    tabs,
    status: true,
  };
}

function makeMainTab(repeatable: boolean, format: CustomTypeFormat): TabSM {
  if (repeatable === false) {
    return format === "page"
      ? { ...DEFAULT_MAIN, sliceZone: DEFAULT_SLICE_ZONE }
      : DEFAULT_MAIN;
  }

  const tabWithUID: TabSM = {
    ...DEFAULT_MAIN,
    value: [
      {
        key: "uid",
        value: {
          type: "UID",
          config: {
            label: "UID",
          },
        },
      },
    ],
  };

  return format === "page"
    ? {
        ...tabWithUID,
        sliceZone: DEFAULT_SLICE_ZONE,
      }
    : tabWithUID;
}

const DEFAULT_MAIN: TabSM = {
  key: "Main",
  value: [],
};

const DEFAULT_SLICE_ZONE: SlicesSM = {
  key: "slices",
  value: [],
};

const DEFAULT_SEO_TAB: TabSM = {
  key: "SEO & Metadata",
  value: [
    {
      key: "meta_title",
      value: {
        type: "Text",
        config: {
          label: "Meta Title",
          placeholder:
            "A title of the page used for social media and search engines",
        },
      },
    },
    {
      key: "meta_description",
      value: {
        type: "StructuredText",
        config: {
          label: "Meta Description",
          placeholder: "A brief summary of the page",
        },
      },
    },
    {
      key: "meta_image",
      value: {
        type: "Image",
        config: {
          label: "Meta Image",
          constraint: {
            width: 2400,
            height: 1260,
          },
          thumbnails: [],
        },
      },
    },
  ],
};
