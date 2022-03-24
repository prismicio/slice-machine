import { jest, describe, afterEach, test, expect } from "@jest/globals";
import path from "path";
import os from "os";
import fs from "fs";
import { Models, CONSTS } from "@slicemachine/core";
import * as initUtils from "../src/utils";
import { installRequiredDependencies } from "../src/steps";

import { stderr } from "stdout-stderr";
class ErrnoException extends Error {
  errno?: number | undefined;
  code?: string | undefined;
  path?: string | undefined;
  syscall?: string | undefined;
}

describe("install required dependency", () => {
  void afterEach(() => {
    jest.clearAllMocks();
  });

  const fakeCWD = "..";

  test("it should use yarn to install Slice Machine", async () => {
    const spy = jest
      .spyOn(initUtils, "execCommand")
      .mockImplementation(() => Promise.resolve({ stderr: "", stdout: "" }));

    jest
      .spyOn(fs, "lstatSync")
      .mockReturnValueOnce({} as fs.Stats) // verify if yarn lock file exists
      .mockReturnValueOnce({} as fs.Stats); // verify package has been installed

    stderr.start();

    await installRequiredDependencies(fakeCWD, Models.Frameworks.nuxt);

    stderr.stop();

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(`yarn add -D ${CONSTS.SM_PACKAGE_NAME}`);

    expect(stderr.output).toContain("Downloading Slice Machine");
    expect(stderr.output).toContain(
      "✔ Slice Machine was installed successfully"
    );
  });

  test("it should use npm to install Slice Machine", async () => {
    const spy = jest
      .spyOn(initUtils, "execCommand")
      .mockImplementation(() => Promise.resolve({ stderr: "", stdout: "" }));

    jest
      .spyOn(fs, "lstatSync")
      .mockImplementationOnce(() => {
        const e = new ErrnoException();
        e.code = "ENOENT";
        throw e;
      })
      .mockReturnValueOnce({} as fs.Stats);

    stderr.start();

    await installRequiredDependencies(fakeCWD, Models.Frameworks.nuxt);

    stderr.stop();

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      `npm install --save-dev ${CONSTS.SM_PACKAGE_NAME}`
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

    jest
      .spyOn(fs, "lstatSync")
      .mockImplementationOnce(() => {
        const e = new ErrnoException();
        e.code = "ENOENT";
        throw e;
      })
      .mockReturnValueOnce({} as fs.Stats);

    const fakedir = path.join(os.tmpdir(), "install-deps");

    stderr.start();

    await installRequiredDependencies(fakedir, Models.Frameworks.react);

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

    jest
      .spyOn(fs, "lstatSync")
      .mockImplementationOnce(() => {
        const e = new ErrnoException();
        e.code = "ENOENT";
        throw e;
      })
      .mockReturnValueOnce({} as fs.Stats);

    const fakedir = path.join(os.tmpdir(), "install-deps");

    stderr.start();

    await installRequiredDependencies(fakedir, Models.Frameworks.next);

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

    jest
      .spyOn(fs, "lstatSync")
      .mockImplementationOnce(() => {
        const e = new ErrnoException();
        e.code = "ENOENT";
        throw e;
      })
      .mockReturnValueOnce({} as fs.Stats);

    const fakedir = path.join(os.tmpdir(), "install-deps");

    stderr.start();

    await installRequiredDependencies(fakedir, Models.Frameworks.svelte);

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

    jest
      .spyOn(fs, "lstatSync")
      .mockImplementationOnce(() => {
        const e = new ErrnoException();
        e.code = "ENOENT";
        throw e;
      })
      .mockReturnValueOnce({} as fs.Stats);

    const fakedir = path.join(os.tmpdir(), "install-deps");

    stderr.start();

    await installRequiredDependencies(fakedir, Models.Frameworks.nuxt);

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

    jest
      .spyOn(fs, "lstatSync")
      .mockImplementationOnce(() => {
        const e = new ErrnoException();
        e.code = "ENOENT";
        throw e;
      })
      .mockReturnValueOnce({} as fs.Stats);

    const fakedir = path.join(os.tmpdir(), "install-deps");

    stderr.start();

    await installRequiredDependencies(fakedir, Models.Frameworks.vue);

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
