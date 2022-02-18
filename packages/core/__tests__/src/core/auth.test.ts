import { describe, expect, test, afterEach, jest } from "@jest/globals";
import * as authHelpers from "../../../src/core/auth";
import { Auth } from "../../../src/core";
import * as Utils from "../../../src/utils";
import * as communication from "../../../src/core/communication";
import { PrismicSharedConfigManager } from "../../../src/filesystem/PrismicSharedConfig";
import { Roles } from "../../../src/models";

jest.mock("../../../src/filesystem");
jest.mock("../../../src/filesystem/PrismicSharedConfig");
jest.mock("../../../src/core/communication");
jest.mock("../../../src/utils/poll");

describe("communication", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const fakeBase = "https://fake.io";
  const endpoints = Utils.Endpoints.buildEndpoints(fakeBase);

  test("login should always have the same parameters", async () => {
    const spy = jest.spyOn(authHelpers, "startServerAndOpenBrowser");
    spy.mockImplementation((url, action, base) => {
      expect(url).toEqual(endpoints.Dashboard.cliLogin);
      expect(action).toEqual("login");
      expect(base).toEqual(fakeBase);
      return Promise.resolve({ onLoginFail: () => null });
    });

    await Auth.login(fakeBase);
  });

  test("signup should always open the browser at the same url", async () => {
    const spy = jest.spyOn(authHelpers, "startServerAndOpenBrowser");
    spy.mockImplementation((url, action, base) => {
      expect(url).toEqual(endpoints.Dashboard.cliSignup);
      expect(action).toEqual("signup");
      expect(base).toEqual(fakeBase);
      return Promise.resolve({ onLoginFail: () => null });
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

  test("validate session should return null if there is no cookies", async () => {
    const mockedConfig = PrismicSharedConfigManager.get as jest.Mock;
    mockedConfig.mockReturnValue({ base: fakeBase, cookies: "" });

    const mockedValidate = communication.validateSession as jest.Mock;
    mockedValidate.mockReturnValue(
      Promise.resolve({
        email: "fake@prismic.io",
        type: "USER",
        repositories: {
          "foo-repo": { dbid: "abcd", role: Roles.PUBLISHER },
          qwerty: { dbid: "efgh", role: Roles.WRITER },
        },
      })
    );

    const result = await Auth.validateSession(fakeBase);
    expect(result).toBe(null);
  });

  test("validate session should return null if there is different bases", async () => {
    const mockedConfig = PrismicSharedConfigManager.get as jest.Mock;
    mockedConfig.mockReturnValue({
      base: "other base",
      cookies: "that's some real cookie data",
    });

    const mockedValidate = communication.validateSession as jest.Mock;
    mockedValidate.mockReturnValue(
      Promise.resolve({
        email: "fake@prismic.io",
        type: "USER",
        repositories: {
          "foo-repo": { dbid: "abcd", role: Roles.PUBLISHER },
          qwerty: { dbid: "efgh", role: Roles.WRITER },
        },
      })
    );

    const result = await Auth.validateSession(fakeBase);
    expect(result).toBe(null);
  });

  test("validate session should return null when validate session reject the promise", async () => {
    const mockedConfig = PrismicSharedConfigManager.get as jest.Mock;
    mockedConfig.mockReturnValue({
      base: fakeBase,
      cookies: "that's some real cookie data",
    });

    const mockedValidate = communication.validateSession as jest.Mock;
    mockedValidate.mockReturnValue(Promise.reject("unauthorized"));

    const result = await Auth.validateSession(fakeBase);
    expect(result).toBe(null);
  });

  test("validate session should work", async () => {
    const userInfo = {
      email: "fake@prismic.io",
      type: "USER",
      repositories: {
        "foo-repo": { dbid: "abcd", role: Roles.PUBLISHER },
        qwerty: { dbid: "efgh", role: Roles.WRITER },
      },
    };

    const mockedConfig = PrismicSharedConfigManager.get as jest.Mock;
    mockedConfig.mockReturnValue({
      base: fakeBase,
      cookies: "that's some real cookie data",
    });

    const mockedValidate = communication.validateSession as jest.Mock;
    mockedValidate.mockReturnValue(Promise.resolve(userInfo));

    const result = await Auth.validateSession(fakeBase);
    expect(result).toBe(userInfo);
  });
});
