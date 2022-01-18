import { jest, describe, afterEach, test, expect } from "@jest/globals";
import * as Core from "@slicemachine/core";
import * as initUtils from "../src/utils";
import { installRequiredDependencies } from "../src/steps";
import path from "path";
import os from "os";

type SpinnerReturnType = ReturnType<typeof Core.Utils.spinner>;

const startFn = jest.fn<SpinnerReturnType, string[]>();
const successFn = jest.fn<SpinnerReturnType, string[]>();
const failFn = jest.fn<SpinnerReturnType, string[]>();

jest.mock("@slicemachine/core", () => {
  const actualCore = jest.requireActual("@slicemachine/core") as typeof Core;

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

describe("install required dependency", () => {
  void afterEach(() => {
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

    await installRequiredDependencies(fakeCWD, Core.Models.Frameworks.nuxt);

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

    await installRequiredDependencies(fakeCWD, Core.Models.Frameworks.nuxt);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      `npm install --save-dev ${Core.Utils.CONSTS.SM_PACKAGE_NAME}`
    );

    expect(successFn).toHaveBeenCalled();
    expect(failFn).not.toHaveBeenCalled();
  });

  test("when using react it should install @prismicio/client and prismic-reactjs", async () => {
    const spy = jest
      .spyOn(initUtils, "execCommand")
      .mockImplementation(() => Promise.resolve({ stderr: "", stdout: "" }));

    fileExistsMock.mockReturnValueOnce(false);
    fileExistsMock.mockReturnValueOnce(true);

    const fakedir = path.join(os.tmpdir(), "install-deps");

    await installRequiredDependencies(fakedir, Core.Models.Frameworks.react);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      "npm install --save prismic-reactjs @prismicio/client"
    );
  });

  test("when using next it should install react deps and next-slicezone", async () => {
    const spy = jest
      .spyOn(initUtils, "execCommand")
      .mockImplementation(() => Promise.resolve({ stderr: "", stdout: "" }));

    fileExistsMock.mockReturnValueOnce(false);
    fileExistsMock.mockReturnValueOnce(true);

    const fakedir = path.join(os.tmpdir(), "install-deps");

    await installRequiredDependencies(fakedir, Core.Models.Frameworks.next);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      "npm install --save prismic-reactjs @prismicio/client next-slicezone @prismicio/slice-simulator-react"
    );
  });

  test("when using svelte it should install prismic-dom", async () => {
    const spy = jest
      .spyOn(initUtils, "execCommand")
      .mockImplementation(() => Promise.resolve({ stderr: "", stdout: "" }));

    fileExistsMock.mockReturnValueOnce(false);
    fileExistsMock.mockReturnValueOnce(true);

    const fakedir = path.join(os.tmpdir(), "install-deps");

    await installRequiredDependencies(fakedir, Core.Models.Frameworks.svelte);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      "npm install --save prismic-dom @prismicio/client"
    );
  });

  test("when using nuxt is should install @nuxtjs/prismic vue-slicezone nuxt-sm", async () => {
    const spy = jest
      .spyOn(initUtils, "execCommand")
      .mockImplementation(() => Promise.resolve({ stderr: "", stdout: "" }));

    fileExistsMock.mockReturnValueOnce(false);
    fileExistsMock.mockReturnValueOnce(true);

    const fakedir = path.join(os.tmpdir(), "install-deps");

    await installRequiredDependencies(fakedir, Core.Models.Frameworks.nuxt);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      "npm install --save @nuxtjs/prismic nuxt-sm vue-slicezone @prismicio/slice-simulator-vue"
    );
  });

  test("when using vue is should install @prismicio/vue @prismicio/client prismic-dom vue-slicezone", async () => {
    const spy = jest
      .spyOn(initUtils, "execCommand")
      .mockImplementation(() => Promise.resolve({ stderr: "", stdout: "" }));

    fileExistsMock.mockReturnValueOnce(false);
    fileExistsMock.mockReturnValueOnce(true);

    const fakedir = path.join(os.tmpdir(), "install-deps");

    await installRequiredDependencies(fakedir, Core.Models.Frameworks.vue);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      "npm install --save @prismicio/vue @prismicio/client prismic-dom vue-slicezone"
    );
  });
});
