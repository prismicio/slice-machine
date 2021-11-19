/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { render } from "../test-utils";
import UpdateModal from "../../components/UpdateModal";
import { rest } from "msw";
import { setupServer } from "msw/node";

const NEEDS_UPDATE = {
  update: true,
  updateCommand: "npm i -D slice-machine-ui",
  packageManager: "npm",
  current: "0.1.0",
  recent: "0.1.1",
};

const NO_UPDATE = {
  ...NEEDS_UPDATE,
  update: false,
};
const server = setupServer(
  rest.get("/api/version", (_, res, ctx) => {
    return res(ctx.json(NEEDS_UPDATE));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("it should open when a more recent version is available", async () => {
  const result = render(<UpdateModal />);

  expect(
    await result.findByText("npm i -D slice-machine-ui")
  ).toBeInTheDocument();
});

test("it should not open when using the most recent version", () => {
  const result = render(<UpdateModal />, {
    preloadedState: { updateVersionInfo: NO_UPDATE },
  });

  expect(result.queryByText("npm i -D slice-machine-ui")).toBeNull();
});
