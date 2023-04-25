import { CustomType } from "@prismicio/types-internal/lib/customtypes";

export const customTypeMock: CustomType = {
  id: "fakeCT",
  label: "My fake CT",
  repeatable: false,
  json: {
    Main: {
      "rich-1": {
        config: {
          label: "rich-1",
          placeholder: "",
          allowTargetBlank: true,
          single:
            "paragraph,preformatted,heading1,heading2,heading3,heading4,heading5,heading6,strong,em,hyperlink,image,embed,list-item,o-list-item,rtl",
        },
        type: "StructuredText",
      },
    },
  },
  status: true,
};
