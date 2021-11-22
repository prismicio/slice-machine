/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import React from "react";
import { render, fireEvent } from "../test-utils";
import Desktop from "../../components/AppLayout/Navigation/Menu/Desktop";
import { NavCtx } from "../../components/AppLayout/Navigation";
import FakeClient from "../../lib/models/common/http/FakeClient";
import { Framework } from "../../lib/models/common/Framework";
import UpdateModal from "../../components/UpdateVersionModal";
import { rest } from "msw";
import { setupServer } from "msw/node";

const NEEDS_UPDATE = {
  update: true,
  updateCommand: "npm i -D slice-machine-ui",
  packageManager: "npm",
  current: "0.1.0",
  recent: "0.1.1",
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
      warnings: [],
      configErrors: {},
    }}
  >
    <Desktop />
    <UpdateModal />
  </NavCtx.Provider>
);

const server = setupServer(
  rest.get("/api/version", (_, res, ctx) => {
    return res(ctx.json(NEEDS_UPDATE));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("when not upto date it should open a model and provided update instructions", async () => {
  const result = render(<App />);
  const text = "npm i -D slice-machine-ui";

  expect(await result.findByText(text)).toBeInTheDocument();

  fireEvent.click(result.getByTestId("update-modal-close"));

  expect(result.queryByText(text)).toBeNull();

  expect(result.queryByText("Update Available")).toBeInTheDocument();

  fireEvent.click(result.getByTestId("update-modal-open"));

  expect(result.queryByText(text)).toBeInTheDocument();
});

test("when up to date it should not prompt the user to update", async () => {
  server.use(
    rest.get("/api/version", (_, res, ctx) => {
      return res(ctx.json({ ...NEEDS_UPDATE, update: false }));
    })
  );

  const result = render(<App />);
  expect(await result.queryByText("Update Available")).toBeNull();
});
