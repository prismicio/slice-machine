import {
  describe,
  expect,
  test,
  afterEach,
  jest,
  beforeEach,
} from "@jest/globals";
import * as authHelpers from "../../src/utils/auth/helpers";
import { Auth } from "../../src/utils/auth";

import { Roles } from "@slicemachine/core/src/models";
import { Prismic } from "@slicemachine/core";
import fs from "fs";
import nock from "nock";

describe("auth", () => {
  beforeEach(() => nock.cleanAll());

  afterEach(() => {
    jest.clearAllMocks();
  });

  const fakeBase = "https://fake.io";
  const endpoints = Prismic.Endpoints.buildEndpoints(fakeBase);

  test("login should always have the same parameters", async () => {
    const fakeProfile = {
      email: "fake@prismic.io",
      type: "USER",
      repositories: {},
    };

    jest.spyOn(fs, "lstatSync").mockReturnValue({} as fs.Stats);
    const fakeCookie = {
      base: fakeBase,
      cookies: "prismic-auth=biscuits",
    };

    jest.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(fakeCookie)); // called more than once?

    nock("https://auth.fake.io")
      .get("/validate?token=biscuits")
      .reply(200, fakeProfile);

    const spy = jest.spyOn(authHelpers, "startServerAndOpenBrowser"); // untestable code, should be refactored
    spy.mockImplementation((url, action, base) => {
      expect(url).toEqual(endpoints.Dashboard.cliLogin);
      expect(action).toEqual("login");
      expect(base).toEqual(fakeBase);
      return Promise.resolve({ onLoginFail: () => null });
    });

    await Auth.login(fakeBase);
  });

  test("signup should always open the browser at the same url", async () => {
    const fakeProfile = {
      email: "fake@prismic.io",
      type: "USER",
      repositories: {},
    };

    jest.spyOn(fs, "lstatSync").mockReturnValue({} as fs.Stats);
    const fakeCookie = {
      base: fakeBase,
      cookies: "prismic-auth=biscuits",
    };

    jest.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(fakeCookie)); // called more than once?

    nock("https://auth.fake.io")
      .get("/validate?token=biscuits")
      .reply(200, fakeProfile);
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
    jest.spyOn(fs, "lstatSync").mockReturnValueOnce({} as fs.Stats);
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(JSON.stringify({ base: fakeBase, cookies: "" }));

    const result = await Auth.validateSession(fakeBase);
    expect(result).toBe(null);
  });

  test("validate session should return null if there is different bases", async () => {
    jest.spyOn(fs, "lstatSync").mockReturnValueOnce({} as fs.Stats);
    const fakeCookie = {
      base: "https://prismic.io",
      cookies: "prismic-auth=biscuits",
    };
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(JSON.stringify(fakeCookie));

    const result = await Auth.validateSession(fakeBase);
    expect(result).toBe(null);
  });

  test("validate session should return null when validate session reject the promise", async () => {
    const fakeCookie = {
      base: "https://prismic.io",
      cookies: "prismic-auth=biscuits",
    };
    jest.spyOn(fs, "lstatSync").mockReturnValueOnce({} as fs.Stats);
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(JSON.stringify(fakeCookie));

    nock("https://auth.prismic.io").get("/validate?token=biscuits").reply(401);

    const result = await Auth.validateSession(fakeBase);
    expect(result).toBe(null);
  });

  test("validate session should work", async () => {
    const fakeCookie = {
      base: "https://prismic.io",
      cookies: "prismic-auth=biscuits",
    };

    const wanted = {
      email: "fake@prismic.io",
      type: "USER",
      repositories: {
        "foo-repo": { dbid: "abcd", role: Roles.PUBLISHER },
        qwerty: { dbid: "efgh", role: Roles.WRITER },
      },
    };

    jest.spyOn(fs, "lstatSync").mockReturnValueOnce({} as fs.Stats);
    // readFileSync seems to be called more than once :/
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(JSON.stringify(fakeCookie));

    nock("https://auth.prismic.io")
      .get("/validate?token=biscuits")
      .reply(200, wanted);

    const got = await Auth.validateSession(fakeCookie.base);
    expect(got).toEqual(wanted);
  });
});
