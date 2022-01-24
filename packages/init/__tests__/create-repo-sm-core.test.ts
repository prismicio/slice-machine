import { test, expect, jest, describe } from "@jest/globals";
import { mocked } from "ts-jest/utils";

import * as core from "@slicemachine/core";
import { createRepository } from "../src/steps/create-repo";
import { stdout, stderr } from "stdout-stderr";

jest.mock("@slicemachine/core", () => ({
  Communication: {
    createRepository: jest.fn().mockImplementation(() => Promise.reject({})),
  },
  Models: {
    Frameworks: {
      next: "next",
    },
  },
  Utils: {
    spinner: jest.fn().mockReturnValue({
      start: jest.fn(),
      stop: jest.fn(),
      fail: jest.fn(),
      succeed: jest.fn(),
    }),
    CONSTS: {
      DEFAULT_BASE: "https://prismic.io",
    },
    writeError: jest.fn(),
    bold: jest.fn(),
  },
}));

describe("mocking the core example: not advised", () => {
  test("mock core to make sure create repo is called", async () => {
    const mockCore = mocked(core, true);
    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementationOnce(() => undefined as never);
    stderr.start();
    stdout.start();
    await createRepository("foo-bar", core.Models.Frameworks.next, {
      base: "https://prismic.io",
      cookies: "prismic-auth=abcd",
    });
    stderr.stop();
    stdout.stop();
    expect(mockCore.Communication.createRepository).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalled();
  });
});
