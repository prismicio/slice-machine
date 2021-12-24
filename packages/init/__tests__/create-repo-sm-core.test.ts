import { test, expect, jest, describe } from "@jest/globals";

import * as core from "@slicemachine/core";
import { createRepository } from "../src/steps/create-repo";
import { stdout, stderr } from "stdout-stderr";

jest.mock("../src/steps/create-repo", () => {
  return {
    createRepository: jest.fn().mockImplementation(() => Promise.reject({})),
  };
});

describe("mocking the core example: not advised", () => {
  test("mock core to make sure create repo is called", async () => {
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
    expect(createRepository).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalled();
  });
});
