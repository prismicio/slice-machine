import ServerState from "@/legacy/lib/models/server/ServerState";

export const dummyServerState: Pick<
  ServerState,
  "env" | "customTypes" | "remoteCustomTypes" | "libraries"
> = {
  env: {
    repo: "sm-env-example",
    manifest: {
      libraries: ["~/slices"],
      apiEndpoint: "https://sm-env-example.prismic.io/api/v2",
      chromaticAppId: "5f5b34f06f304800225c4e17",
      tracking: false,
      localSliceSimulatorURL: "http://localhost:3000/slice-simulator",
    },
    packageManager: "npm",
    endpoints: {
      PrismicWroom: "https://prismic.io/",
      PrismicAuthentication: "https://auth.prismic.io/",
      PrismicModels: "https://customtypes.prismic.io/",
      PrismicUser: "https://user-service.prismic.io/",
      AwsAclProvider:
        "https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/",
      PrismicEmbed: "https://oembed.prismic.io",
      PrismicUnsplash: "https://unsplash.prismic.io/",
      SliceMachineV1: "https://sm-api.prismic.io/v1/",
      RepositoryService: "https://repository.internal.prismic.io/",
      LocaleService: "https://locale.internal.prismic.io/",
    },
    shortId: "shortId",
  },
  customTypes: [
    {
      id: "about",
      label: "My Cool About Page",
      format: "custom",
      repeatable: false,
      status: true,
      tabs: [
        {
          key: "Main",
          value: [
            {
              key: "title",
              value: {
                type: "StructuredText",
                config: {
                  label: "",
                  placeholder: "",
                  allowTargetBlank: true,
                  single:
                    "paragraph,preformatted,heading1,heading2,heading3,heading4,heading5,heading6,strong,em,hyperlink,image,embed,list-item,o-list-item,rtl",
                },
              },
            },
          ],
        },
      ],
    },
  ],
  // @ts-expect-error TS(2322) FIXME: Type '{ env: { repo: string; manifest: { libraries... Remove this comment to see the full error message
  remoteSlices: [],
  remoteCustomTypes: [],
  libraries: [],
};
