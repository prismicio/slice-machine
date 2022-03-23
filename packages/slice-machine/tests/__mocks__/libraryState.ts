import type { Models } from "@slicemachine/core";

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
      screenshotPaths: {},
      model: {
        id: "sliceId",
        type: "SharedSlice",
        name: "SliceName",
        description: "slice description",
        variations: [
          {
            id: "default-slice",
            name: "Default slice",
            docURL: "...",
            version: "sktwi1xtmkfgx8626",
            description: "MyAwesomeSlice",
            primary: {
              title: {
                type: "StructuredText",
                config: {
                  single: "heading1",
                  label: "Title",
                  placeholder: "This is where it all begins...",
                },
              },
              description: {
                type: "StructuredText",
                config: {
                  single: "paragraph",
                  label: "Description",
                  placeholder: "A nice description of your product",
                },
              },
            },
          },
        ],
      },
    },
  ],
});
