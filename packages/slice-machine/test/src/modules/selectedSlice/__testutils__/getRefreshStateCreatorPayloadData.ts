import { SlicesTypes } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { dummyServerState } from "../../__fixtures__/serverState";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";

export const getRefreshStateCreatorPayloadData = (
  libraryName: string,
  modelId: string
) => {
  const MOCK_UPDATED_LIBRARY: LibraryUI[] = [
    {
      path: "../../e2e-projects/next/slices/ecommerce",
      isLocal: true,
      name: libraryName,
      components: [
        {
          from: "slices/ecommerce",
          href: "slices--ecommerce",
          pathToSlice: "./slices/ecommerce",
          fileName: "index",
          extension: "js",
          screenshots: {
            "default-slice": {
              path: "updated-screenshot-path",
              hash: "f92c69c60df8fd8eb42902bfb6574776",
              url: "http://localhost:9999/api/__preview?q=default-slice",
            },
          },
          mock: [],
          model: {
            id: modelId,
            type: SlicesTypes.SharedSlice,
            name: "CategoryPreviewWithImageBackgrounds",
            description: "CategoryPreviewWithImageBackgrounds",
            variations: [
              {
                id: "default-slice",
                name: "Default slice",
                docURL: "...",
                version: "sktwi1xtmkfgx8626",
                description: "MockSlice",
                primary: [
                  {
                    key: "Title",
                    value: {
                      config: {
                        label: "Title",
                        placeholder: "My first Title...",
                      },
                      type: WidgetTypes.Text,
                    },
                  },
                ],
                items: [],
              },
            ],
          },
        },
      ],
      meta: {
        isNodeModule: false,
        isDownloaded: false,
        isManual: true,
      },
    },
  ];

  return {
    env: dummyServerState.env,
    libraries: MOCK_UPDATED_LIBRARY,
    localCustomTypes: [],
    remoteCustomTypes: [],
    remoteSlices: [],
  };
};
