import { CustomTypeSM, TabSM } from "@lib/models/common/CustomType";

const DEFAULT_SEO_TAB: TabSM = {
  key: "Metadata",
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

export const createCustomType = (
  id: string,
  label: string,
  repeatable: boolean
): CustomTypeSM => {
  const mainTab: TabSM = {
    key: "Main",
    value: repeatable
      ? [
          {
            key: "uid",
            value: {
              type: "UID",
              config: {
                label: "UID",
              },
            },
          },
        ]
      : [],
  };

  const tabs: TabSM[] = [mainTab, DEFAULT_SEO_TAB];

  return {
    id,
    label,
    repeatable,
    tabs,
    status: true,
  };
};
