import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

const allFieldSliceModel = {
  id: "all_fields",
  type: "SharedSlice",
  name: "AllFields",
  description: "AllFields",
  variations: [
    {
      id: "default-slice",
      name: "Default slice",
      imageUrl: "",
      docURL: "...",
      version: "sktwi1xtmkfgx8626",
      description: "AllFields",
      primary: {
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
        "link-2": {
          config: {
            label: "link-2",
            placeholder: "",
            select: "web",
            allowTargetBlank: false,
          },
          type: "Link",
        },
        "select-3": {
          config: {
            label: "select-3",
            placeholder: "",
            options: ["1", "2"],
          },
          type: "Select",
        },
        "date-4": {
          config: {
            label: "date-4",
            placeholder: "",
          },
          type: "Date",
        },
        "embed-5": {
          config: {
            label: "embed-5",
            placeholder: "",
          },
          type: "Embed",
        },
        "geo-6": {
          config: {
            label: "geo-6",
          },
          type: "GeoPoint",
        },
        "keytext-7": {
          config: {
            label: "keytext-7",
            placeholder: "",
          },
          type: "Text",
        },
        "image-8": {
          config: {
            label: "image-8",
            constraint: {},
            thumbnails: [],
          },
          type: "Image",
        },
        "contentRS-9": {
          config: {
            label: "contentRS-9",
            select: "document",
            customtypes: [],
          },
          type: "Link",
        },
        "bool-10": {
          config: {
            label: "bool-10",
            placeholder_false: "false",
            placeholder_true: "true",
            default_value: false,
          },
          type: "Boolean",
        },
        "ts-11": {
          config: {
            label: "ts-11",
            placeholder: "",
          },
          type: "Timestamp",
        },
        "number-12": {
          config: {
            label: "number-12",
            placeholder: "",
          },
          type: "Number",
        },
        "color-13": {
          config: {
            label: "color-13",
            placeholder: "",
          },
          type: "Color",
        },
      },
      items: {},
    },
    {
      id: "newVar",
      name: "NewVar",
      imageUrl: "",
      docURL: "...",
      version: "sktwi1xtmkfgx8626",
      description: "AllFields",
      primary: {
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
        "link-2": {
          config: {
            label: "link-2",
            placeholder: "",
            select: "web",
            allowTargetBlank: false,
          },
          type: "Link",
        },
        "select-3": {
          config: {
            label: "select-3",
            placeholder: "",
            options: ["1", "2"],
          },
          type: "Select",
        },
        "date-4": {
          config: {
            label: "date-4",
            placeholder: "",
          },
          type: "Date",
        },
        "embed-5": {
          config: {
            label: "embed-5",
            placeholder: "",
          },
          type: "Embed",
        },
        "geo-6": {
          config: {
            label: "geo-6",
          },
          type: "GeoPoint",
        },
        "keytext-7": {
          config: {
            label: "keytext-7",
            placeholder: "",
          },
          type: "Text",
        },
        "image-8": {
          config: {
            label: "image-8",
            constraint: {},
            thumbnails: [],
          },
          type: "Image",
        },
        "contentRS-9": {
          config: {
            label: "contentRS-9",
            select: "document",
            customtypes: [],
          },
          type: "Link",
        },
        "bool-10": {
          config: {
            label: "bool-10",
            placeholder_false: "false",
            placeholder_true: "true",
            default_value: false,
          },
          type: "Boolean",
        },
        "ts-11": {
          config: {
            label: "ts-11",
            placeholder: "",
          },
          type: "Timestamp",
        },
        "number-12": {
          config: {
            label: "number-12",
            placeholder: "",
          },
          type: "Number",
        },
        "color-13": {
          config: {
            label: "color-13",
            placeholder: "",
          },
          type: "Color",
        },
      },
      items: {},
    },
  ],
} as unknown as SharedSlice;

export default allFieldSliceModel;
