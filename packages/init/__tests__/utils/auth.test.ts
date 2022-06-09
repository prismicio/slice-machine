import { describe, expect, test, afterEach, jest } from "@jest/globals";
import * as authHelpers from "../../src/utils/auth/helpers";
import { Auth, Client } from "../../src/utils";

import { Endpoints } from "@slicemachine/core/build/prismic";
import fs from "fs";
import nock from "nock";
import { ApplicationMode } from "@slicemachine/client";

Client.initialize(ApplicationMode.PROD, "biscuits");

describe("auth", () => {
  afterEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();
  });

  const fakeBase = "https://prismic.io/";
  const endpoints = Endpoints.buildEndpoints(fakeBase);

  const userProfile = {
    userId: "1234567",
    shortId: "12",
    intercomHash: "intercomHash",
    email: "batman@example.com",
    firstName: "bat",
    lastName: "man",
  };

  test("login should always have the same parameters", async () => {
    jest.spyOn(fs, "lstatSync").mockReturnValue({} as fs.Stats);
    const fakeCookie = {
      base: fakeBase,
      cookies: "prismic-auth=biscuits",
    };

    jest.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(fakeCookie)); // called more than once?

    nock("https://user.internal-prismic.io")
      .matchHeader("Authorization", `Bearer biscuits`)
      .get("/profile")
      .reply(200, userProfile);

    const spy = jest.spyOn(authHelpers, "startServerAndOpenBrowser"); // untestable code, should be refactored
    spy.mockImplementation((url, action, base) => {
      expect(url).toEqual(endpoints.Dashboard.cliLogin);
      expect(action).toEqual("login");
      expect(base).toEqual(fakeBase);
      return Promise.resolve({ onLoginFail: () => null });
    });

    await Auth.login(fakeBase);
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

  test("validate session should return false when validate session reject the promise", async () => {
    const fakeCookie = {
      base: "https://prismic.io",
      cookies: "prismic-auth=biscuits",
    };
    jest.spyOn(fs, "lstatSync").mockReturnValueOnce({} as fs.Stats);
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(JSON.stringify(fakeCookie));

    nock("https://user.internal-prismic.io")
      .matchHeader("Authorization", `Bearer biscuits`)
      .get("/profile")
      .reply(401);

    const result = await Auth.validateSession();
    expect(result).toBe(false);
  });

  test("validate session should work", async () => {
    const fakeCookie = {
      base: "https://prismic.io",
      cookies: "prismic-auth=biscuits",
    };

    jest.spyOn(fs, "lstatSync").mockReturnValueOnce({} as fs.Stats);
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(JSON.stringify(fakeCookie));

    nock("https://user.internal-prismic.io")
      .matchHeader("Authorization", `Bearer biscuits`)
      .get("/profile")
      .reply(200, userProfile);

    const got = await Auth.validateSession();
    expect(got).toEqual(true);
  });
});
