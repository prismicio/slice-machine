import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";
import { SlicesTypes } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import type { Models } from "@prismic-beta/slicemachine-core";

export const MockLibraryInfo: (
  lib: string
) => Models.Library<Models.Component> = (lib: string) => ({
  name: lib,
  path: "/" + lib,
  isLocal: true,
  components: [
    {
      from: lib,
      href: "http://myscreenshotuploaded",
      pathToSlice: "/slice1",
      fileName: "slice1/models.json",
      extension: "js",
      screenshots: {},
      model: {
        id: "sliceId",
        type: SlicesTypes.SharedSlice,
        name: "SliceName",
        description: "slice description",
        variations: [
          {
            id: "default-slice",
            imageUrl: "",
            name: "Default slice",
            docURL: "...",
            version: "sktwi1xtmkfgx8626",
            description: "MyAwesomeSlice",
            primary: [
              {
                key: "title",
                value: {
                  type: WidgetTypes.RichText,
                  config: {
                    single: "heading1",
                    label: "Title",
                    placeholder: "This is where it all begins...",
                  },
                },
              },
              {
                key: "description",
                value: {
                  type: WidgetTypes.RichText,
                  config: {
                    single: "paragraph",
                    label: "Description",
                    placeholder: "A nice description of your product",
                  },
                },
              },
            ],
            items: [],
          },
        ],
      },
    },
  ],
});
