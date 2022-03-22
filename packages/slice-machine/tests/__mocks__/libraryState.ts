import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";
import { SlicesTypes } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import type { Models } from "@slicemachine/core";
import { Slices } from "@slicemachine/core/build/src/models";

export const MockLibraryInfo: (
  lib: string
) => Models.Library<Models.Component> = (lib: string) => {
  const model = Slices.toSM({
    id: "slice1",
    type: SlicesTypes.SharedSlice,
    name: "slice1",
    description: "slice1",
    variations: [
      {
        id: "default-slice",
        imageUrl: "",
        name: "Default slice",
        docURL: "...",
        version: "sktwi1xtmkfgx8626",
        description: "MyAwesomeSlice",
        primary: {
          title: {
            type: WidgetTypes.RichText,
            config: {
              single: "heading1",
              label: "Title",
              placeholder: "This is where it all begins...",
            },
          },
          description: {
            type: WidgetTypes.RichText,
            config: {
              single: "paragraph",
              label: "Description",
              placeholder: "A nice description of your product",
            },
          },
        },
      },
    ],
  });
  return {
    name: lib,
    path: "/" + lib,
    isLocal: true,
    components: [
      {
        from: lib,
        href: "http://myscreenshotuploaded",
        pathToSlice: "/slice1",
        infos: {
          sliceName: "slice1",
          fileName: "slice1/models.json",
          isDirectory: false,
          extension: "js",
          model,
          nameConflict: null,
          screenshotPaths: {},
          meta: { id: "slice1" },
        },
        model,
        migrated: true,
      },
    ],
  };
};
