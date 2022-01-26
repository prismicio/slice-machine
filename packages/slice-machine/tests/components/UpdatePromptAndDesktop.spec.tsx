/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import React from "react";
import { render, fireEvent } from "../test-utils";
import Desktop from "../../components/AppLayout/Navigation/Menu/Desktop";
import { Models } from "@slicemachine/core";
import UpdateModal from "../../components/UpdateVersionModal";
import { FrontEndEnvironment } from "@lib/models/common/Environment";
import { Frameworks } from "@slicemachine/core/build/src/models";
import { EnvironmentStoreType } from "@src/modules/environment/types";

jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "",
      query: "",
      asPath: "",
    };
  },
}));

const App = () => (
  <>
    <Desktop links={[]} />
    <UpdateModal />
  </>
);

const FAKE_ENVIRONMENT: EnvironmentStoreType = {
  warnings: [],
  configErrors: {},
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
};

const STATE_FOR_UPDATE = {
  environment: FAKE_ENVIRONMENT,
};
test.skip("when not up to date it should open a model and provided update instructions", async () => {
  const result = render(<App />, { preloadedState: STATE_FOR_UPDATE });
  const text = "npm i --save-dev slice-machine-ui";

  expect(await result.findByText(text)).toBeInTheDocument();

  fireEvent.click(result.getByTestId("update-modal-close"));

  expect(result.queryByText(text)).toBeNull();

  expect(result.queryByText("Update Available")).toBeInTheDocument();

  fireEvent.click(result.getByTestId("update-modal-open"));

  expect(result.queryByText(text)).toBeInTheDocument();
});

test("when up to date it should not prompt the user to update", async () => {
  const result = render(<App />, {
    preloadedState: {
      ...STATE_FOR_UPDATE,
      environment: {
        ...STATE_FOR_UPDATE.environment,
        env: {
          ...STATE_FOR_UPDATE.environment.env,
          updateVersionInfo: {
            ...STATE_FOR_UPDATE.environment.env.updateVersionInfo,
            updateAvailable: false,
          },
        },
      },
    },
  });
  expect(await result.queryByText("Update Available")).toBeNull();
});
