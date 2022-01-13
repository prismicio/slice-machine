import {
  describe,
  expect,
  test,
  jest,
  afterAll,
  afterEach,
} from "@jest/globals";
import { Auth } from "../../../src/core";
import { Roles } from "../../../src/utils/roles";
import nock from "nock";
import * as fs from "fs";

jest.mock("fs");

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  return nock.restore();
});

describe("Core.Auth.validateSessionAndGetProfile", () => {
  test("if base does not match the base in the config it should return null", async () => {
    const fakeToken = "biscuits";
    const fakeCookie = `prismic-auth=${fakeToken}`;
    const fakeBase = "https://prismic.io";

    jest.spyOn(fs, "lstatSync").mockImplementationOnce(() => ({} as fs.Stats));

    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(
        JSON.stringify({ cookies: fakeCookie, base: fakeBase })
      );

    const result = await Auth.validateSessionAndGetProfile(
      "https://example.com"
    );

    expect(result).toBeNull();
  });

  test("is should validate the session and get the users profile", async () => {
    const fakeToken = "biscuits";
    const fakeCookie = `prismic-auth=${fakeToken}`;
    const fakeBase = "https://prismic.io";

    const firstName = "bat";
    const lastName = "man";
    const email = "batman@example.com";
    const userId = "1234567";
    const shortId = "12";
    const type = "USER";
    const repositories = {
      "foo-repo": { dbid: "abcd", role: Roles.OWNER },
      qwerty: { dbid: "efgh", role: Roles.WRITER },
    };

    jest.spyOn(fs, "lstatSync").mockImplementationOnce(() => ({} as fs.Stats));

    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(
        JSON.stringify({ cookies: fakeCookie, base: fakeBase })
      );

    nock("https://auth.prismic.io")
      .get(`/validate?token=${fakeToken}`)
      .reply(200, {
        userId,
        email,
        type,
        repositories,
      });

    nock("https://user.prismic.io")
      .matchHeader("Authorization", `Bearer Token ${fakeToken}`)
      .get("/profile")
      .reply(200, {
        userId,
        shortId,
        email,
        firstName,
        lastName,
      });

    const result = await Auth.validateSessionAndGetProfile(fakeBase);

    expect(result).not.toBeNull();

    expect(result?.email).toEqual(email);
    expect(result?.shortId).toEqual(shortId);
    expect(result?.userId).toEqual(userId);
  });
});
