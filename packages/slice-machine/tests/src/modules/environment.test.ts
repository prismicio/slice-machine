import { environmentReducer, getStateCreator } from "@src/modules/environment";
import { EnvironmentStoreType } from "@src/modules/environment/types";
import { Frameworks } from "@slicemachine/core/build/src/models";

const dummyEnvironmentState: EnvironmentStoreType = {
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
    prismicAPIUrl: "https://prismic.io",
  },
  warnings: [],
  configErrors: {},
};

describe("[Environment module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      expect(environmentReducer(dummyEnvironmentState, {})).toEqual(
        dummyEnvironmentState
      );
    });

    it("should return the initial state if no matching action", () => {
      expect(
        environmentReducer(dummyEnvironmentState, { type: "NO.MATCH" })
      ).toEqual(dummyEnvironmentState);
    });

    it("should update the environment state given STATE/GET.RESPONSE action", () => {
      const action = getStateCreator({
        ...dummyEnvironmentState,
        env: {
          ...dummyEnvironmentState.env,
          repo: "newUrl",
        },
        remoteCustomTypes: [],
        localCustomTypes: [],
      });

      expect(environmentReducer(dummyEnvironmentState, action)).toEqual({
        ...dummyEnvironmentState,
        env: {
          ...dummyEnvironmentState.env,
          repo: "newUrl",
        },
      });
    });
  });
});
