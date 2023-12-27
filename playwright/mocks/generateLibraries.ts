import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

import { generateRandomId } from "../utils";

type GenerateTypesArgs = { slicesCount: number };

export type Library = {
  name: string;
  path: string;
  isLocal: boolean;
  components: {
    from: string;
    href: string;
    pathToSlice: string;
    fileName: string | null;
    extension: string | null;
    model: SharedSlice;
    screenshots: Record<
      string,
      {
        hash: string;
        data: Buffer;
      }
    >;
  }[];
  meta: {
    name?: string;
    version?: string;
    isNodeModule: boolean;
    isDownloaded: boolean;
    isManual: boolean;
  };
};

export function generateLibraries(args: GenerateTypesArgs): Library[] {
  const { slicesCount } = args;

  return [
    {
      name: "slices",
      path: "slices",
      isLocal: true,
      components: Array.from({ length: slicesCount }, (_, n) => ({
        from: "slices",
        href: "slices",
        pathToSlice: "pathToSlice",
        fileName: "fileName",
        extension: "extension",
        model: {
          id: `test_slice_${n}_${generateRandomId()}`,
          type: "SharedSlice",
          name: `TestSlice${n}${generateRandomId()}`,
          description: "ExternalVideoSlice",
          variations: [
            {
              id: `default`,
              name: `Default`,
              docURL: "...",
              version: "sktwi1xtmkfgx8626",
              description: "ExternalVideoSlice",
              primary: {
                video: {
                  type: "IntegrationFields",
                  config: {
                    catalog: "demo-sm-next-ecom--external_videos",
                    label: "Video",
                  },
                },
              },
              items: {},
              imageUrl:
                "https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
            },
          ],
        },
        screenshots: {},
        mocks: [],
      })),
      meta: {
        isNodeModule: false,
        isDownloaded: false,
        isManual: true,
      },
    },
  ];
}
