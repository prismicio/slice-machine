/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { render } from "@testing-library/react";
import UpdateVersionModal from "../../components/UpdateVersionModal";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

describe("UpdateVersionModal", () => {
  beforeEach(() => {
    useSelector.mockClear();
    useDispatch().mockClear();
  });
  test("when no up to date it should dispatch an open update version modal action and not display the modal", async () => {
    const mockedDispatch = jest.fn();
    useSelector.mockImplementation(() => ({
      isOpen: false,
      updateVersionInfo: {
        currentVersion: "0.2.0",
        latestVersion: "0.2.2",
        packageManager: "npm",
        updateCommand: "npm i --save-dev slice-machine-ui",
        updateAvailable: true,
      },
    }));
    useDispatch().mockReturnValue(mockedDispatch);
    const result = render(<UpdateVersionModal />);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "MODAL/OPEN",
      payload: {
        modalKey: "UPDATE_VERSION",
      },
    });
    expect(await result.queryByText("Update Available")).toBeNull();
  });
  test("when up to date it shouldn't dispatch an open update version modal action and not display the modal", async () => {
    const mockedDispatch = jest.fn();
    useSelector.mockImplementation(() => ({
      isOpen: false,
      updateVersionInfo: {
        currentVersion: "0.2.2",
        latestVersion: "0.2.2",
        packageManager: "npm",
        updateCommand: "npm i --save-dev slice-machine-ui",
        updateAvailable: false,
      },
    }));
    useDispatch().mockReturnValue(mockedDispatch);
    const result = render(<UpdateVersionModal />);
    expect(mockDispatch).toHaveBeenCalledTimes(0);
    expect(await result.queryByText("Update Available")).toBeNull();
  });
  test("when no up to date it should display the modal", async () => {
    const mockedDispatch = jest.fn();
    useSelector.mockImplementation(() => ({
      isOpen: true,
      updateVersionInfo: {
        currentVersion: "0.2.0",
        latestVersion: "0.2.2",
        packageManager: "npm",
        updateCommand: "npm i --save-dev slice-machine-ui",
        updateAvailable: true,
      },
    }));
    useDispatch().mockReturnValue(mockedDispatch);
    const result = render(<UpdateVersionModal />);
    expect(mockDispatch).toHaveBeenCalledTimes(0);
    expect(
      await result.findByText("npm i --save-dev slice-machine-ui")
    ).toBeInTheDocument();
  });
});
