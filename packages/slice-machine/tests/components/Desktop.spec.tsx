/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "../test-utils";
import Desktop from "../../components/AppLayout/Navigation/Menu/Desktop";
import { NavCtx } from "../../components/AppLayout/Navigation";
import FakeClient from "../../lib/models/common/http/FakeClient";
import { Framework } from "../../lib/models/common/Framework";

const DEFAULT_STATE = {
  modal: {
    LOGIN: false,
    NEW_VERSION: false,
  },
  updateVersionInfo: {
    updateCommand: "npm i -D slice-machine-ui",
    packageManager: "npm",
    update: false,
    current: "0.1.1",
    recent: "0.1.1",
  },
};

const UPDATE_REQUIRED_STATE = {
  ...DEFAULT_STATE,
  updateVersionInfo: {
    ...DEFAULT_STATE.updateVersionInfo,
    update: true,
  },
};

const userConfig = {
  apiEndpoint: "",
  storybook: "",
  chromaticAppId: "",
  _latest: "",
};
const env = {
  cwd: "",
  userConfig,
  hasConfigFile: false,
  prismicData: { base: "" },
  currentVersion: "",
  framework: Framework.react,
  baseUrl: "",
  hasGeneratedStoriesPath: true,
  client: new FakeClient(),
  mockConfig: {},
};

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
  <NavCtx.Provider
    value={{
      links: [],
      env,
      warnings: [],
      configErrors: {},
    }}
  >
    <Desktop />
  </NavCtx.Provider>
);

test("should not show message if no update is required", () => {
  render(<App />, { preloadedState: DEFAULT_STATE });
  expect(screen.queryByText("Update Available")).toBeNull();
});

test("should display update message", () => {
  const result = render(<App />, { preloadedState: UPDATE_REQUIRED_STATE });
  expect(result.queryByText("Update Available")).not.toBeNull();
});
