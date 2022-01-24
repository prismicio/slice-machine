/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { render, fireEvent } from "../test-utils";
import LoginModal from "@components/LoginModal";
import { ModalKeysEnum, ModalStoreType } from "@src/modules/modal/types";
import { LoadingKeysEnum, LoadingStoreType } from "@src/modules/loading/types";
import { FrontEndEnvironment } from "@lib/models/common/Environment";
import { EnvironmentStoreType } from "@src/modules/environment/types";
import ToastProvider from "../../src/ToastProvider";
// import { AnalyticsBrowser } from "@segment/analytics-next";
import { setupServer } from "msw/node";
import { rest } from "msw";

jest.mock("@segment/analytics-next", () => {
  const NativeTrackerMocks = {
    track: jest.fn().mockImplementation(() => Promise.resolve()),
    identify: jest.fn().mockImplementation(() => Promise.resolve()),
    group: jest.fn().mockImplementation(() => Promise.resolve()),
  };
  return {
    standalone: Promise.resolve(NativeTrackerMocks),
  };
});

jest.mock("react-toast-notifications", () => {
  return {
    ToastProvider: ({
      autoDismiss,
      autoDismissTimeout,
      components,
      ...rest
    }: {
      autoDismiss: boolean;
      autoDismissTimeout: number;
      components: any;
    }) => {
      return <div {...rest} />;
    },
    useToasts: () => ({ addToast: jest.fn() }),
  };
});

const App = () => (
  <ToastProvider>
    <LoginModal />
  </ToastProvider>
);

// Mock segement stuff
// intercepts /api/auth/start
// Intercept api polling
// handle window.open

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
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("LoginModal", () => {
  window.open = jest.fn();

  const div = document.createElement("div");
  div.id = "__next";
  document.body.appendChild(div);

  test("when given a prismic url in env it should open to primsic.io/dashboard", () => {
    const result = render(<App />, {
      preloadedState: {
        environment: {
          env: {
            prismicAPIUrl: "https://prismic.io",
            sliceMachineAPIUrl: "http://localhost:9999/",
            manifest: {
              apiEndpoint: "https://foo.prismic.io/api/v2",
            },
          } as FrontEndEnvironment,
        } as EnvironmentStoreType,
        modal: {
          [ModalKeysEnum.LOGIN]: true,
        } as ModalStoreType,
        loading: {
          [LoadingKeysEnum.LOGIN]: false,
        } as LoadingStoreType,
      },
    });

    fireEvent.click(result.getByText("Signin to Prismic"));
    expect(result.getByText("Click here").closest("a")).toHaveAttribute(
      "href",
      "https://prismic.io/dashboard/cli/login?source=slice-machine&port=9999&path=/api/auth"
    );
  });

  test("when given wroom.io url it should open to wroom.io/dashboard", () => {
    const result = render(<App />, {
      preloadedState: {
        environment: {
          env: {
            prismicAPIUrl: "https://prismic.io",
            sliceMachineAPIUrl: "http://localhost:9999/",
            manifest: {
              apiEndpoint: "https://foo.wroom.io/api/v2",
            },
          } as FrontEndEnvironment,
        } as EnvironmentStoreType,
        modal: {
          [ModalKeysEnum.LOGIN]: true,
        } as ModalStoreType,
        loading: {
          [LoadingKeysEnum.LOGIN]: false,
        } as LoadingStoreType,
      },
    });

    fireEvent.click(result.getByText("Signin to Prismic"));
    expect(result.getByText("Click here").closest("a")).toHaveAttribute(
      "href",
      "https://wroom.io/dashboard/cli/login?source=slice-machine&port=9999&path=/api/auth"
    );
  });
});
