// @vitest-environment jsdom

import { describe, test, expect, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import LoginModal from "@components/LoginModal";
import { FrontEndEnvironment } from "@lib/models/common/Environment";
import { useSelector } from "react-redux";

const mockDispatch = vi.fn();
vi.mock("react-beautiful-dnd", () => {
  return {};
});
vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
  useDispatch: () => mockDispatch,
}));

const useSelectorMock = vi.mocked(useSelector);

const App = () => <LoginModal />;

describe("LoginModal", () => {
  window.open = vi.fn();

  const div = document.createElement("div");
  div.id = "__next";
  document.body.appendChild(div);

  test("when given a prismic url in env it should open to prismic.io/dashboard", () => {
    useSelectorMock.mockImplementation(() => ({
      env: {
        manifest: {
          apiEndpoint: "https://foo.prismic.io/api/v2",
        },
      } as FrontEndEnvironment,
      isOpen: true,
      isLoginLoading: true,
    }));
    const result = render(<App />);

    expect(result.getByText("Click here").closest("a")).toHaveAttribute(
      "href",
      // Since we're not using the `start-slicemachine` server proxy, port defaults to Next/React Testing Library's default port
      "https://prismic.io/dashboard/cli/login?source=slice-machine&port=3000&path=/api/auth"
    );
  });

  test("when given wroom.io url it should open to wroom.io/dashboard", () => {
    useSelectorMock.mockImplementation(() => ({
      env: {
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
      // Since we're not using the `start-slicemachine` server proxy, port defaults to Next/React Testing Library's default port
      "https://wroom.io/dashboard/cli/login?source=slice-machine&port=3000&path=/api/auth"
    );
  });
});
