const allFieldComponent = {
  from: "slices",
  href: "slices",
  pathToSlice: "./slices",
  infos: {
    sliceName: "AllFields",
    fileName: "index",
    isDirectory: true,
    extension: "vue",
    model: {
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
              config: { label: "date-4", placeholder: "" },
              type: "Date",
            },
            "embed-5": {
              config: { label: "embed-5", placeholder: "" },
              type: "Embed",
            },
            "geo-6": { config: { label: "geo-6" }, type: "GeoPoint" },
            "keytext-7": {
              config: { label: "keytext-7", placeholder: "" },
              type: "Text",
            },
            "image-8": {
              config: { label: "image-8", constraint: {}, thumbnails: [] },
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
              config: { label: "ts-11", placeholder: "" },
              type: "Timestamp",
            },
            "number-12": {
              config: { label: "number-12", placeholder: "" },
              type: "Number",
            },
            "color-13": {
              config: { label: "color-13", placeholder: "" },
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
              config: { label: "date-4", placeholder: "" },
              type: "Date",
            },
            "embed-5": {
              config: { label: "embed-5", placeholder: "" },
              type: "Embed",
            },
            "geo-6": { config: { label: "geo-6" }, type: "GeoPoint" },
            "keytext-7": {
              config: { label: "keytext-7", placeholder: "" },
              type: "Text",
            },
            "image-8": {
              config: { label: "image-8", constraint: {}, thumbnails: [] },
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
              config: { label: "ts-11", placeholder: "" },
              type: "Timestamp",
            },
            "number-12": {
              config: { label: "number-12", placeholder: "" },
              type: "Number",
            },
            "color-13": {
              config: { label: "color-13", placeholder: "" },
              type: "Color",
            },
          },
          items: {},
        },
      ],
    },
    meta: { id: "all_fields", name: "AllFields", description: "AllFields" },
    mock: [
      {
        variation: "default-slice",
        name: "Default slice",
        slice_type: "all_fields",
        items: [],
        primary: {
          "link-2": { link_type: "Web", url: "https://slicemachine.dev" },
          "select-3": "1",
          "rich-1": [
            {
              type: "paragraph",
              text: "Eiusmod duis veniam excepteur. Veniam ullamco culpa elit cillum laboris aliquip occaecat culpa quis.",
              spans: [],
            },
          ],
          "date-4": "2020-10-08",
          "embed-5": {
            title: "Data Modelling — Create your Custom Types and Slices",
            author_name: "Prismic",
            author_url:
              "https://www.youtube.com/channel/UCJq6AEgtWeZt7ziQ-fLKOeA",
            type: "video",
            height: 113,
            width: 200,
            version: "1.0",
            provider_name: "YouTube",
            provider_url: "https://www.youtube.com/",
            thumbnail_height: 360,
            thumbnail_width: 480,
            thumbnail_url: "https://i.ytimg.com/vi/c-ATzcy6VkI/hqdefault.jpg",
            html: '<iframe width="200" height="113" src="https://www.youtube.com/embed/c-ATzcy6VkI?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
          },
          "geo-6": { latitude: 48.8583736, longitude: 2.2922926 },
          "keytext-7": "streamline vertical supply-chains",
          "image-8": {
            dimensions: { width: 900, height: 500 },
            alt: "Placeholder image",
            copyright: null,
            url: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=900&h=500&fit=crop",
          },
          "contentRS-9": { link_type: "Web", url: "https://prismic.io" },
          "bool-10": false,
          "ts-11": "2013-09-01T02:40:40.639Z",
          "number-12": 3620,
          "color-13": "#068de5",
        },
      },
      {
        variation: "newVar",
        name: "NewVar",
        slice_type: "all_fields",
        items: [],
        primary: {
          "rich-1": [
            {
              type: "paragraph",
              text: "Ut laborum velit eu occaecat sint. Eu laboris ullamco ea ullamco deserunt anim Lorem proident magna deserunt Lorem excepteur.",
              spans: [],
            },
          ],
          "link-2": { link_type: "Web", url: "https://slicemachine.dev" },
          "select-3": "1",
          "date-4": "2021-09-03",
          "embed-5": {
            title: "Introducing Slice Machine",
            author_name: "Prismic",
            author_url:
              "https://www.youtube.com/channel/UCJq6AEgtWeZt7ziQ-fLKOeA",
            type: "video",
            height: 113,
            width: 200,
            version: "1.0",
            provider_name: "YouTube",
            provider_url: "https://www.youtube.com/",
            thumbnail_height: 360,
            thumbnail_width: 480,
            thumbnail_url: "https://i.ytimg.com/vi/iewZXv94XGY/hqdefault.jpg",
            html: '<iframe width="200" height="113" src="https://www.youtube.com/embed/iewZXv94XGY?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
          },
          "geo-6": { latitude: 48.8606111, longitude: 2.337644 },
          "keytext-7": "visualize cross-media action-items",
          "image-8": {
            dimensions: { width: 900, height: 500 },
            alt: "Placeholder image",
            copyright: null,
            url: "https://images.unsplash.com/photo-1600861194802-a2b11076bc51?w=900&h=500&fit=crop",
          },
          "contentRS-9": { link_type: "Web", url: "http://google.com" },
          "bool-10": true,
          "ts-11": "2016-12-06T20:50:21.298Z",
          "number-12": 7100,
          "color-13": "#232f0f",
        },
      },
    ],
    screenshotPaths: {
      "default-slice": {
        path: "tests/project/slices/AllFields/default-slice/preview.jpeg",
      },
    },
  },
  model: {
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
            config: { label: "select-3", placeholder: "", options: ["1", "2"] },
            type: "Select",
          },
          "date-4": {
            config: { label: "date-4", placeholder: "" },
            type: "Date",
          },
          "embed-5": {
            config: { label: "embed-5", placeholder: "" },
            type: "Embed",
          },
          "geo-6": { config: { label: "geo-6" }, type: "GeoPoint" },
          "keytext-7": {
            config: { label: "keytext-7", placeholder: "" },
            type: "Text",
          },
          "image-8": {
            config: { label: "image-8", constraint: {}, thumbnails: [] },
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
            config: { label: "ts-11", placeholder: "" },
            type: "Timestamp",
          },
          "number-12": {
            config: { label: "number-12", placeholder: "" },
            type: "Number",
          },
          "color-13": {
            config: { label: "color-13", placeholder: "" },
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
            config: { label: "select-3", placeholder: "", options: ["1", "2"] },
            type: "Select",
          },
          "date-4": {
            config: { label: "date-4", placeholder: "" },
            type: "Date",
          },
          "embed-5": {
            config: { label: "embed-5", placeholder: "" },
            type: "Embed",
          },
          "geo-6": { config: { label: "geo-6" }, type: "GeoPoint" },
          "keytext-7": {
            config: { label: "keytext-7", placeholder: "" },
            type: "Text",
          },
          "image-8": {
            config: { label: "image-8", constraint: {}, thumbnails: [] },
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
            config: { label: "ts-11", placeholder: "" },
            type: "Timestamp",
          },
          "number-12": {
            config: { label: "number-12", placeholder: "" },
            type: "Number",
          },
          "color-13": {
            config: { label: "color-13", placeholder: "" },
            type: "Color",
          },
        },
        items: {},
      },
    ],
  },
  migrated: false,
};

export default allFieldComponent;
