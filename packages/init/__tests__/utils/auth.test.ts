import { describe, expect, test, afterEach, jest } from "@jest/globals";
import * as authHelpers from "../../src/utils/auth/helpers";
import { Auth, InitClient } from "../../src/utils";

import { Endpoints } from "@slicemachine/core/build/prismic";
import fs from "fs";
import nock from "nock";
import { ApplicationMode } from "@slicemachine/client";

const userProfile = {
  userId: "1234567",
  shortId: "12",
  intercomHash: "intercomHash",
  email: "batman@example.com",
  firstName: "bat",
  lastName: "man",
};

const fakeToken = "biscuits";
const fakeAuthHeader = `Bearer ${fakeToken}`;
const fakeCookies = `prismic-auth=${fakeToken}`;

const client = new InitClient(ApplicationMode.PROD, null, fakeToken);

const fakeBase = client.apisEndpoints.Wroom;
const endpoints = Endpoints.buildEndpoints(fakeBase);

const fakeSharedConfig = {
  base: fakeBase,
  cookies: fakeCookies,
};

describe("auth", () => {
  afterEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();
  });

  test("login should always have the same parameters", async () => {
    jest.spyOn(fs, "lstatSync").mockReturnValue({} as fs.Stats);
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValue(JSON.stringify(fakeSharedConfig));

    nock(client.apisEndpoints.Users)
      .matchHeader("Authorization", fakeAuthHeader)
      .get("/profile")
      .reply(200, userProfile);

    const spy = jest.spyOn(authHelpers, "startServerAndOpenBrowser"); // untestable code, should be refactored
    spy.mockImplementation((url, action, base) => {
      expect(url).toEqual(endpoints.Dashboard.cliLogin);
      expect(action).toEqual("login");
      expect(base).toEqual(fakeBase);
      return Promise.resolve({ onLoginFail: () => null });
    });

    await Auth.login(client);
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
    jest.spyOn(fs, "lstatSync").mockReturnValueOnce({} as fs.Stats);
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(JSON.stringify(fakeSharedConfig));

    nock(client.apisEndpoints.Users)
      .matchHeader("Authorization", fakeAuthHeader)
      .get("/profile")
      .reply(401);

    const result = await Auth.validateSession(client);
    expect(result).toBe(false);
  });

  test("validate session should work", async () => {
    jest.spyOn(fs, "lstatSync").mockReturnValueOnce({} as fs.Stats);
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(JSON.stringify(fakeSharedConfig));

    nock(client.apisEndpoints.Users)
      .matchHeader("Authorization", fakeAuthHeader)
      .get("/profile")
      .reply(200, userProfile);

    const got = await Auth.validateSession(client);
    expect(got).toEqual(true);
  });
});
