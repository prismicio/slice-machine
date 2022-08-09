/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { render } from "@testing-library/react";
import LoginModal from "@components/LoginModal";
import { FrontEndEnvironment } from "@lib/models/common/Environment";
import { useSelector, useDispatch } from "react-redux";
import { setupServer } from "msw/node";
import { rest, RestContext } from "msw";

const mockDispatch = jest.fn();
jest.mock("react-beautiful-dnd", () => {});
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

const useSelectorMock = useSelector as jest.Mock;
const useDispatchMock = useDispatch() as jest.Mock;

const App = () => <LoginModal />;

const server = setupServer(
  rest.post("/api/auth/start", (_, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.post("/api/auth/status", (_, res, ctx) => {
    return res(
      ctx.json({
        status: "ok", //"error" | "ok" | "pending";
        userId: "foo",
      })
    );
  }),
  rest.post("/api/s", (_, res, ctx) => {
    return res(ctx.json({}));
  })
);

const makeTrackerSpy = () =>
  jest.fn((_req: any, res: any, ctx: RestContext) => {
    return res(ctx.json({}));
  });

const interceptTracker = (spy: ReturnType<typeof makeTrackerSpy>) =>
  server.use(rest.post("/api/s", spy));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
beforeEach(() => {
  useSelectorMock.mockClear();
  useDispatchMock.mockClear();
});

describe("LoginModal", () => {
  window.open = jest.fn();

  const div = document.createElement("div");
  div.id = "__next";
  document.body.appendChild(div);

  test("when given a prismic url in env it should open to prismic.io/dashboard", () => {
    useSelectorMock.mockImplementation(() => ({
      env: {
        sliceMachineAPIUrl: "http://localhost:9999/",
        manifest: {
          apiEndpoint: "https://foo.prismic.io/api/v2",
        },
      } as FrontEndEnvironment,
      isOpen: true,
      isLoginLoading: true,
    }));

    const trackerSpy = makeTrackerSpy();
    interceptTracker(trackerSpy);

    const result = render(<App />);

    expect(result.getByText("Click here").closest("a")).toHaveAttribute(
      "href",
      "https://prismic.io/dashboard/cli/login?source=slice-machine&port=9999&path=/api/auth"
    );
  });

  test("when given wroom.io url it should open to wroom.io/dashboard", () => {
    useSelectorMock.mockImplementation(() => ({
      env: {
        sliceMachineAPIUrl: "http://localhost:9999/",
        manifest: {
          apiEndpoint: "https://foo.wroom.io/api/v2",
        },
      } as FrontEndEnvironment,
      isOpen: true,
      isLoginLoading: true,
    }));
    const result = render(<App />);

    expect(result.getByText("Click here").closest("a")).toHaveAttribute(
      "href",
      "https://wroom.io/dashboard/cli/login?source=slice-machine&port=9999&path=/api/auth"
    );
  });
});
