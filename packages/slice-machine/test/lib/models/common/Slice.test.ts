import { describe, expect, test } from "vitest";
import { Slices, SliceSM } from "@lib/models/common/Slice";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

const sliceObject = {
  id: "all_fields",
  type: "SharedSlice",
  name: "AllFields",
  description: "AllFields",
  variations: [
    {
      id: "default-slice",
      name: "Default slice",
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

// this is the result of Slice.toArray from SM v0.3.2
const sliceArray = {
  id: "all_fields",
  type: "SharedSlice",
  name: "AllFields",
  description: "AllFields",
  variations: [
    {
      id: "default-slice",
      name: "Default slice",
      docURL: "...",
      version: "sktwi1xtmkfgx8626",
      description: "AllFields",
      primary: [
        {
          key: "rich-1",
          value: {
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
        {
          key: "link-2",
          value: {
            config: {
              label: "link-2",
              placeholder: "",
              select: "web",
              allowTargetBlank: false,
            },
            type: "Link",
          },
        },
        {
          key: "select-3",
          value: {
            config: {
              label: "select-3",
              placeholder: "",
              options: ["1", "2"],
            },
            type: "Select",
          },
        },
        {
          key: "date-4",
          value: {
            config: {
              label: "date-4",
              placeholder: "",
            },
            type: "Date",
          },
        },
        {
          key: "embed-5",
          value: {
            config: {
              label: "embed-5",
              placeholder: "",
            },
            type: "Embed",
          },
        },
        {
          key: "geo-6",
          value: {
            config: {
              label: "geo-6",
            },
            type: "GeoPoint",
          },
        },
        {
          key: "keytext-7",
          value: {
            config: {
              label: "keytext-7",
              placeholder: "",
            },
            type: "Text",
          },
        },
        {
          key: "image-8",
          value: {
            config: {
              label: "image-8",
              constraint: {},
              thumbnails: [],
            },
            type: "Image",
          },
        },
        {
          key: "contentRS-9",
          value: {
            config: {
              label: "contentRS-9",
              select: "document",
              customtypes: [],
            },
            type: "Link",
          },
        },
        {
          key: "bool-10",
          value: {
            config: {
              label: "bool-10",
              placeholder_false: "false",
              placeholder_true: "true",
              default_value: false,
            },
            type: "Boolean",
          },
        },
        {
          key: "ts-11",
          value: {
            config: {
              label: "ts-11",
              placeholder: "",
            },
            type: "Timestamp",
          },
        },
        {
          key: "number-12",
          value: {
            config: {
              label: "number-12",
              placeholder: "",
            },
            type: "Number",
          },
        },
        {
          key: "color-13",
          value: {
            config: {
              label: "color-13",
              placeholder: "",
            },
            type: "Color",
          },
        },
      ],
      items: [],
    },
    {
      id: "newVar",
      name: "NewVar",
      docURL: "...",
      version: "sktwi1xtmkfgx8626",
      description: "AllFields",
      primary: [
        {
          key: "rich-1",
          value: {
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
        {
          key: "link-2",
          value: {
            config: {
              label: "link-2",
              placeholder: "",
              select: "web",
              allowTargetBlank: false,
            },
            type: "Link",
          },
        },
        {
          key: "select-3",
          value: {
            config: {
              label: "select-3",
              placeholder: "",
              options: ["1", "2"],
            },
            type: "Select",
          },
        },
        {
          key: "date-4",
          value: {
            config: {
              label: "date-4",
              placeholder: "",
            },
            type: "Date",
          },
        },
        {
          key: "embed-5",
          value: {
            config: {
              label: "embed-5",
              placeholder: "",
            },
            type: "Embed",
          },
        },
        {
          key: "geo-6",
          value: {
            config: {
              label: "geo-6",
            },
            type: "GeoPoint",
          },
        },
        {
          key: "keytext-7",
          value: {
            config: {
              label: "keytext-7",
              placeholder: "",
            },
            type: "Text",
          },
        },
        {
          key: "image-8",
          value: {
            config: {
              label: "image-8",
              constraint: {},
              thumbnails: [],
            },
            type: "Image",
          },
        },
        {
          key: "contentRS-9",
          value: {
            config: {
              label: "contentRS-9",
              select: "document",
              customtypes: [],
            },
            type: "Link",
          },
        },
        {
          key: "bool-10",
          value: {
            config: {
              label: "bool-10",
              placeholder_false: "false",
              placeholder_true: "true",
              default_value: false,
            },
            type: "Boolean",
          },
        },
        {
          key: "ts-11",
          value: {
            config: {
              label: "ts-11",
              placeholder: "",
            },
            type: "Timestamp",
          },
        },
        {
          key: "number-12",
          value: {
            config: {
              label: "number-12",
              placeholder: "",
            },
            type: "Number",
          },
        },
        {
          key: "color-13",
          value: {
            config: {
              label: "color-13",
              placeholder: "",
            },
            type: "Color",
          },
        },
      ],
      items: [],
    },
  ],
} as unknown as SliceSM;

describe("Slice", () => {
  test("toSM equal toArray", () => {
    const result = Slices.toSM(sliceObject);
    expect(result).toMatchObject(sliceArray);
  });
  test("toSM equal toObject", () => {
    const result = Slices.fromSM(sliceArray);
    expect(result).toMatchObject(sliceObject);
  });
});
