import { jest, describe, afterEach, test, expect } from "@jest/globals";
import * as Core from "@slicemachine/core";
import * as initUtils from "../src/utils";
import { installRequiredDependencies } from "../src/steps";
import path from "path";
import os from "os";
import { stderr } from "stdout-stderr";

jest.mock("@slicemachine/core", () => {
  const actualCore = jest.requireActual("@slicemachine/core") as typeof Core;

  return {
    ...actualCore,
    NodeUtils: {
      // fragile test issue
      ...actualCore.NodeUtils,
      Files: {
        ...actualCore.NodeUtils.Files,
        exists: jest.fn(),
      },
    },
  };
});

describe("install required dependency", () => {
  void afterEach(() => {
    jest.clearAllMocks();
  });

  const fakeCWD = "..";
  const fileExistsMock = Core.NodeUtils.Files.exists as jest.Mock; // eslint-disable-line @typescript-eslint/unbound-method

  test("it should use yarn to install Slice Machine", async () => {
    const spy = jest
      .spyOn(initUtils, "execCommand")
      .mockImplementation(() => Promise.resolve({ stderr: "", stdout: "" }));

    fileExistsMock.mockReturnValueOnce(true); // verify if yarn lock file exists
    fileExistsMock.mockReturnValueOnce(true); // verify package has been installed

    stderr.start();

    await installRequiredDependencies(fakeCWD, Core.Models.Frameworks.nuxt);

    stderr.stop();

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      `yarn add -D ${Core.CONSTS.SM_PACKAGE_NAME}`
    );

    expect(stderr.output).toContain("Downloading Slice Machine");
    expect(stderr.output).toContain(
      "✔ Slice Machine was installed successfully"
    );
  });

  test("it should use npm to install Slice Machine", async () => {
    const spy = jest
      .spyOn(initUtils, "execCommand")
      .mockImplementation(() => Promise.resolve({ stderr: "", stdout: "" }));

    fileExistsMock.mockReturnValueOnce(false); // verify if yarn lock file exists
    fileExistsMock.mockReturnValueOnce(true); // verify package has been installed
    stderr.start();

    await installRequiredDependencies(fakeCWD, Core.Models.Frameworks.nuxt);

    stderr.stop();

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      `npm install --save-dev ${Core.CONSTS.SM_PACKAGE_NAME}`
    );

    expect(stderr.output).toContain("Downloading Slice Machine");
    expect(stderr.output).toContain(
      "✔ Slice Machine was installed successfully"
    );
  });

  test("when using react it should install @prismicio/client and @prismicio/react and @prismicio/helpers", async () => {
    const spy = jest
      .spyOn(initUtils, "execCommand")
      .mockImplementation(() => Promise.resolve({ stderr: "", stdout: "" }));

    fileExistsMock.mockReturnValueOnce(false);
    fileExistsMock.mockReturnValueOnce(true);

    const fakedir = path.join(os.tmpdir(), "install-deps");

    stderr.start();

    await installRequiredDependencies(fakedir, Core.Models.Frameworks.react);

    stderr.stop();

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      "npm install --save @prismicio/react @prismicio/client @prismicio/helpers"
    );

    expect(stderr.output).toContain("Downloading Slice Machine");
    expect(stderr.output).toContain(
      "✔ Slice Machine was installed successfully"
    );
  });

  test("when using next it should install next deps and next-slicezone", async () => {
    const spy = jest
      .spyOn(initUtils, "execCommand")
      .mockImplementation(() => Promise.resolve({ stderr: "", stdout: "" }));

    fileExistsMock.mockReturnValueOnce(false);
    fileExistsMock.mockReturnValueOnce(true);

    const fakedir = path.join(os.tmpdir(), "install-deps");

    stderr.start();

    await installRequiredDependencies(fakedir, Core.Models.Frameworks.next);

    stderr.stop();

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      "npm install --save @prismicio/react @prismicio/client @prismicio/slice-simulator-react @prismicio/helpers"
    );

    expect(stderr.output).toContain("Downloading Slice Machine");
    expect(stderr.output).toContain(
      "✔ Slice Machine was installed successfully"
    );
  });

  test("when using svelte it should install prismic-dom", async () => {
    const spy = jest
      .spyOn(initUtils, "execCommand")
      .mockImplementation(() => Promise.resolve({ stderr: "", stdout: "" }));

    fileExistsMock.mockReturnValueOnce(false);
    fileExistsMock.mockReturnValueOnce(true);

    const fakedir = path.join(os.tmpdir(), "install-deps");

    stderr.start();

    await installRequiredDependencies(fakedir, Core.Models.Frameworks.svelte);

    stderr.stop();

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      "npm install --save prismic-dom @prismicio/client"
    );

    expect(stderr.output).toContain("Downloading Slice Machine");
    expect(stderr.output).toContain(
      "✔ Slice Machine was installed successfully"
    );
  });

  test("when using nuxt is should install @nuxtjs/prismic", async () => {
    const spy = jest
      .spyOn(initUtils, "execCommand")
      .mockImplementation(() => Promise.resolve({ stderr: "", stdout: "" }));

    fileExistsMock.mockReturnValueOnce(false);
    fileExistsMock.mockReturnValueOnce(true);

    const fakedir = path.join(os.tmpdir(), "install-deps");

    stderr.start();

    await installRequiredDependencies(fakedir, Core.Models.Frameworks.nuxt);

    stderr.stop();

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      "npm install --save @nuxtjs/prismic @prismicio/slice-simulator-vue"
    );

    expect(stderr.output).toContain("Downloading Slice Machine");
    expect(stderr.output).toContain(
      "✔ Slice Machine was installed successfully"
    );
  });

  test("when using vue is should install @prismicio/vue @prismicio/client prismic-dom", async () => {
    const spy = jest
      .spyOn(initUtils, "execCommand")
      .mockImplementation(() => Promise.resolve({ stderr: "", stdout: "" }));

    fileExistsMock.mockReturnValueOnce(false);
    fileExistsMock.mockReturnValueOnce(true);

    const fakedir = path.join(os.tmpdir(), "install-deps");

    stderr.start();

    await installRequiredDependencies(fakedir, Core.Models.Frameworks.vue);

    stderr.stop();

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      "npm install --save @prismicio/vue @prismicio/client prismic-dom"
    );

    expect(stderr.output).toContain("Downloading Slice Machine");
    expect(stderr.output).toContain(
      "✔ Slice Machine was installed successfully"
    );
  });
});
