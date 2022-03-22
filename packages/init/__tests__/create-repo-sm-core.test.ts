import { test, expect, jest, describe } from "@jest/globals";
import { mocked } from "jest-mock";

import * as core from "@slicemachine/core";
import { createRepository } from "../src/utils/create-repo";
import { stdout, stderr } from "stdout-stderr";

jest.mock("@slicemachine/core", () => ({
  // fragile test issue, wy did we keep this version and not the other?
  Prismic: {
    Communication: {
      createRepository: jest.fn().mockImplementation(() => Promise.reject({})),
    },
  },
  Models: {
    Frameworks: {
      next: "next",
    },
  },
  CONSTS: {
    DEFAULT_BASE: "https://prismic.io",
  },
}));

describe("mocking the core example: not advised", () => {
  test("mock core to make sure create repo is called", async () => {
    const mockCore = mocked(core, true);
    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementationOnce(() => undefined as never);

    jest.spyOn(console, "error").mockImplementation(() => undefined);

    stderr.start();
    stdout.start();
    await createRepository(
      "foo-bar",
      core.Models.Frameworks.next,
      "https://prismic.io",
      "prismic-auth=abcd"
    );
    stderr.stop();
    stdout.stop();
    expect(mockCore.Prismic.Communication.createRepository).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalled();
  });
});
