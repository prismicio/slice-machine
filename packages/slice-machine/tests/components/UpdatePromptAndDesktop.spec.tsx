/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import React from "react";
import { render, fireEvent } from "../test-utils";
import Desktop from "../../components/AppLayout/Navigation/Menu/Desktop";
import FakeClient from "../../lib/models/common/http/FakeClient";
import { Models } from "@slicemachine/core";
import UpdateModal from "../../components/UpdateVersionModal";
import Environment from "@lib/models/common/Environment";

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

const FAKE_ENVIRONMENT = {
  warnings: [],
  configErrors: {},
  env: {
    cwd: "./tests/project",
    repo: "sm-env-example",
    userConfig: {
      libraries: ["~/slices", "@/slices2/src/slices"],
      apiEndpoint: "",
      storybook: "",
      chromaticAppId: "",
      _latest: "0.1.0",
    },
    hasConfigFile: true,
    prismicData: {
      base: "",
      auth: "",
    },
    chromatic: {
      storybook: "",
      library: "",
    },
    updateVersionInfo: {
      currentVersion: "0.1.1",
      latestVersion: "0.1.1",
      packageManager: "npm" as "npm" | "yarn",
      updateCommand: "npm i --save-dev slice-machine-ui",
      updateAvailable: true,
    },
    mockConfig: {},
    hasGeneratedStoriesPath: true,
    framework: Models.Frameworks.next,
    baseUrl: "http://localhost:9999",
    client: new FakeClient(),
  } as Environment,
};

const STATE_FOR_UPDATE = {
  environment: FAKE_ENVIRONMENT,
};

test("when not up to date it should open a model and provided update instructions", async () => {
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
