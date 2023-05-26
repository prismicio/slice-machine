import { CustomTypeSM, TabSM } from "@lib/models/common/CustomType";
import { SlicesSM } from "@lib/models/common/Slices";
import { CustomTypeFormat } from "@slicemachine/manager";

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
        },
      },
    },
  ],
};

const DEFAULT_SLICE_ZONE: SlicesSM = {
  key: "slices",
  value: [],
};

const DEFAULT_MAIN: TabSM = {
  key: "Main",
  value: [],
};

function makeMainTab(repeatable: boolean, format: CustomTypeFormat): TabSM {
  if (repeatable === false) return DEFAULT_MAIN;

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

  if (format === "page")
    return {
      ...tabWithUID,
      sliceZone: DEFAULT_SLICE_ZONE,
    };

  return tabWithUID;
}

export const createCustomType = (
  id: string,
  label: string,
  repeatable: boolean,
  format: CustomTypeFormat
): CustomTypeSM => {
  const mainTab = makeMainTab(repeatable, format);

  const tabs: TabSM[] = [mainTab];

  if (format === "page") {
    tabs.push(DEFAULT_SEO_TAB);
  }

  // TODO: don't cast this

  const fmt = format as CustomTypeSM["format"];

  return {
    id,
    label,
    format: fmt,
    repeatable,
    tabs,
    status: true,
  };
};
