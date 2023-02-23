import { describe, expect, test } from "vitest";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { CustomTypes, CustomTypeSM } from "@lib/models/common/CustomType";

const customTypeObject = {
  id: "test-page",
  label: "Test page",
  repeatable: true,
  status: true,
  json: {
    Main: {
      uid: {
        config: {
          label: "Uid",
          placeholder: "",
        },
        type: "UID",
      },
      Title: {
        config: {
          label: "Title",
          placeholder: "",
          allowTargetBlank: true,
          single:
            "paragraph,preformatted,heading1,heading2,heading3,heading4,heading5,heading6,strong,em,hyperlink,image,embed,list-item,o-list-item,rtl",
        },
        type: "StructuredText",
      },
      Illustration: {
        config: {
          label: "Illustration",
          constraint: {},
          thumbnails: [],
        },
        type: "Image",
      },
      someStuff: {
        config: {
          label: "Some Stuff",
          fields: {
            someText: {
              config: {
                label: "Some Text",
                placeholder: "",
                allowTargetBlank: true,
                single:
                  "paragraph,preformatted,heading1,heading2,heading3,heading4,heading5,heading6,strong,em,hyperlink,image,embed,list-item,o-list-item,rtl",
              },
              type: "StructuredText",
            },
            someImage: {
              config: {
                label: "Some Image",
                constraint: {},
                thumbnails: [],
              },
              type: "Image",
            },
            someNumber: {
              config: {
                label: "Some Number",
                placeholder: "",
              },
              type: "Number",
            },
          },
        },
        type: "Group",
      },
      someColor: {
        config: {
          label: "Some Color",
          placeholder: "",
        },
        type: "Color",
      },
    },
  },
} as unknown as CustomType;

const customTypeArray = {
  id: "test-page",
  label: "Test page",
  repeatable: true,
  tabs: [
    {
      key: "Main",
      value: [
        {
          key: "uid",
          value: {
            config: {
              label: "Uid",
              placeholder: "",
            },
            type: "UID",
          },
        },
        {
          key: "Title",
          value: {
            config: {
              label: "Title",
              placeholder: "",
              allowTargetBlank: true,
              single:
                "paragraph,preformatted,heading1,heading2,heading3,heading4,heading5,heading6,strong,em,hyperlink,image,embed,list-item,o-list-item,rtl",
            },
            type: "StructuredText",
          },
        },
        {
          key: "Illustration",
          value: {
            config: {
              label: "Illustration",
              constraint: {},
              thumbnails: [],
            },
            type: "Image",
          },
        },
        {
          key: "someStuff",
          value: {
            config: {
              label: "Some Stuff",
              fields: [
                {
                  key: "someText",
                  value: {
                    config: {
                      label: "Some Text",
                      placeholder: "",
                      allowTargetBlank: true,
                      single:
                        "paragraph,preformatted,heading1,heading2,heading3,heading4,heading5,heading6,strong,em,hyperlink,image,embed,list-item,o-list-item,rtl",
                    },
                    type: "StructuredText",
                  },
                },
                {
                  key: "someImage",
                  value: {
                    config: {
                      label: "Some Image",
                      constraint: {},
                      thumbnails: [],
                    },
                    type: "Image",
                  },
                },
                {
                  key: "someNumber",
                  value: {
                    config: {
                      label: "Some Number",
                      placeholder: "",
                    },
                    type: "Number",
                  },
                },
              ],
            },
            type: "Group",
          },
        },
        {
          key: "someColor",
          value: {
            config: {
              label: "Some Color",
              placeholder: "",
            },
            type: "Color",
          },
        },
      ],
    },
  ],
  status: true,
} as unknown as CustomTypeSM;

describe("CustomType", () => {
  test("toSM equal toArray", () => {
    const result = CustomTypes.toSM(customTypeObject);
    expect(result).toMatchObject(customTypeArray);
  });
  test("toSM equal toObject", () => {
    const result = CustomTypes.fromSM(customTypeArray);
    expect(result).toMatchObject(customTypeObject);
  });
});
