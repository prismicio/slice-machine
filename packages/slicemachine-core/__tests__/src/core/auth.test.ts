import { describe, expect, test, afterAll } from "@jest/globals";
import * as authHelpers from "../../../src/core/auth";
import { Auth } from "../../../src/core";
import { buildEndpoints } from "../../../src/utils";

describe("communication", () => {
  afterAll(() => {
    jest.clearAllMocks();
    return;
  });

  const fakeBase = "https://prismic.io";
  const endpoints = buildEndpoints(fakeBase);

  test("login should always have the same parameters", async () => {
    const spy = jest.spyOn(authHelpers, "startServerAndOpenBrowser");
    spy.mockImplementation((url, action, base) => {
      expect(url).toEqual(endpoints.Dashboard.cliLogin);
      expect(action).toEqual("login");
      expect(base).toEqual(fakeBase);
      return Promise.resolve();
    });

    await Auth.login(fakeBase);
  });

  test("signup should always open the browser at the same url", async () => {
    const spy = jest.spyOn(authHelpers, "startServerAndOpenBrowser");
    spy.mockImplementation((url, action, base) => {
      expect(url).toEqual(endpoints.Dashboard.cliSignup);
      expect(action).toEqual("signup");
      expect(base).toEqual(fakeBase);
      return Promise.resolve();
    });

    await Auth.signup(fakeBase);
  });

  test("isHandler should work", () => {
    const handlerData: authHelpers.HandlerData = {
      email: "fake",
      cookies: ["bla", "ta", "cla"],
    };

    const nonHandlerData = "this should not work";
    const nonHandlerData2 = {
      email: "this should not work",
    };
    const nonHandlerData3 = {
      cookies: {
        status: "this is not an array",
      },
    };
    const nonHandlerData4 = {
      email: "this should not work",
      cookies: {
        status: "this is not an array",
      },
    };
    const nonHandlerData5 = {
      email: "this should not work",
      cookies: ["2", 3, 4],
    };

    expect(authHelpers.isHandlerData(handlerData)).toBe(true);
    expect(authHelpers.isHandlerData(nonHandlerData)).toBe(false);
    expect(authHelpers.isHandlerData(nonHandlerData2)).toBe(false);
    expect(authHelpers.isHandlerData(nonHandlerData3)).toBe(false);
    expect(authHelpers.isHandlerData(nonHandlerData4)).toBe(false);
    expect(authHelpers.isHandlerData(nonHandlerData5)).toBe(false);
  });
});
