import ServerState from "@models/server/ServerState";
import { Frameworks } from "@slicemachine/core/build/src/models";
import { FieldType } from "@models/common/CustomType/fields";

export const dummyServerState: Pick<
  ServerState,
  | "env"
  | "customTypes"
  | "warnings"
  | "remoteCustomTypes"
  | "configErrors"
  | "libraries"
> = {
  env: {
    repo: "sm-env-example",
    manifest: {
      libraries: ["~/slices"],
      apiEndpoint: "https://sm-env-example.prismic.io/api/v2",
      storybook: "http://localhost:6006",
      chromaticAppId: "5f5b34f06f304800225c4e17",
      framework: "next",
      tracking: false,
      localSliceSimulatorURL: "http://localhost:3000/slice-simulator",
    },
    updateVersionInfo: {
      currentVersion: "0.2.0",
      latestVersion: "0.1.2",
      packageManager: "npm",
      updateCommand: "npm i --save-dev slice-machine-ui",
      updateAvailable: false,
    },
    mockConfig: {},
    framework: Frameworks.next,
    sliceMachineAPIUrl: "http://localhost:9999",
    shortId: "shortId",
  },
  warnings: [],
  configErrors: {},
  customTypes: [
    {
      id: "about",
      label: "My Cool About Page",
      repeatable: false,
      status: true,
      tabs: {
        Main: {
          key: "Main",
          value: {
            title: {
              type: FieldType.StructuredText,
              config: {
                label: "",
                placeholder: "",
                allowTargetBlank: true,
                single:
                  "paragraph,preformatted,heading1,heading2,heading3,heading4,heading5,heading6,strong,em,hyperlink,image,embed,list-item,o-list-item,rtl",
              },
            },
          },
        },
      },
    },
  ],
  remoteCustomTypes: [],
  libraries: [],
};
