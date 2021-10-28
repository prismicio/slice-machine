import { jest, describe, afterEach, test, expect } from "@jest/globals";
import * as Core from "slicemachine-core";
import * as initUtils from "../src/utils";
import { installSm } from "../src/steps";

type SpinnerReturnType = ReturnType<typeof Core.Utils.spinner>;

const startFn = jest.fn<SpinnerReturnType, string[]>();
const successFn = jest.fn<SpinnerReturnType, string[]>();
const failFn = jest.fn<SpinnerReturnType, string[]>();

jest.mock("slicemachine-core", () => {
  const actualCore = jest.requireActual("slicemachine-core") as typeof Core;

  return {
    ...actualCore,
    Utils: {
      ...actualCore.Utils,
      Files: {
        ...actualCore.Utils.Files,
        exists: jest.fn(),
      },
      spinner: () => ({
        start: startFn,
        succeed: successFn,
        fail: failFn,
      }),
    },
  };
});

describe("install SM builder dependency", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const fakeCWD = "..";
  const fileExistsMock = Core.Utils.Files.exists as jest.Mock; // eslint-disable-line @typescript-eslint/unbound-method

  test("it should use yarn to install the builder", async () => {
    const spy = jest
      .spyOn(initUtils, "execCommand")
      .mockImplementation(() => Promise.resolve({ stderr: "", stdout: "" }));

    fileExistsMock.mockReturnValueOnce(true); // verify if yarn lock file exists
    fileExistsMock.mockReturnValueOnce(true); // verify package has been installed

    await installSm(fakeCWD);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      `yarn add -D ${Core.Utils.CONSTS.SM_PACKAGE_NAME}`
    );

    expect(successFn).toHaveBeenCalled();
    expect(failFn).not.toHaveBeenCalled();
  });

  test("it should use npm to install the builder", async () => {
    const spy = jest
      .spyOn(initUtils, "execCommand")
      .mockImplementation(() => Promise.resolve({ stderr: "", stdout: "" }));

    fileExistsMock.mockReturnValueOnce(false); // verify if yarn lock file exists
    fileExistsMock.mockReturnValueOnce(true); // verify package has been installed

    await installSm(fakeCWD);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      `npm install --save-dev ${Core.Utils.CONSTS.SM_PACKAGE_NAME}`
    );

    expect(successFn).toHaveBeenCalled();
    expect(failFn).not.toHaveBeenCalled();
  });
});
