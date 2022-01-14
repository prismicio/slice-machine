import {
  describe,
  expect,
  test,
  afterAll,
  afterEach,
  jest,
} from "@jest/globals";

import nock from "nock";
import * as fs from "fs";
import { Utils } from "@slicemachine/core";
import * as communication from "../src/utils/communication";

jest.mock("fs");

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  return nock.restore();
});

describe("communication.getUserPrfile", () => {
  test("when called with cookies it should fetch the user profile form 'https://user.prismic.io/profile`", async () => {
    const token = "biscuits";
    const cookie = `prismic-auth=${token}`;

    nock("https://user.prismic.io")
      .matchHeader("Authorization", `Bearer Token ${token}`)
      .get("/profile")
      .reply(200, {
        userId: "1234",
        shortId: "12",
        email: "batman@example.com",
        firstName: "Bat",
        lastName: "Man",
      });

    const result = await communication.getUserProfile(cookie);

    expect(result.shortId).toEqual("12");
  });

  test("when given data that is not valid it should throw an error", async () => {
    const token = "biscuits";
    const cookie = `prismic-auth=${token}`;

    nock("https://user.prismic.io")
      .matchHeader("Authorization", `Bearer Token ${token}`)
      .get("/profile")
      .reply(200, {});

    await expect(() =>
      communication.getUserProfile(cookie)
    ).rejects.toThrowError("Can't parse user profile");
  });
});

describe("communication.validateSessionAndGetProfile", () => {
  test("if base does not match the base in the config it should return null", async () => {
    const fakeToken = "biscuits";
    const fakeCookie = `prismic-auth=${fakeToken}`;
    const fakeBase = "https://wroom.io";

    jest.spyOn(fs, "lstatSync").mockImplementationOnce(() => ({} as fs.Stats));

    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(
        JSON.stringify({ cookies: fakeCookie, base: fakeBase })
      );

    const result = await communication.validateSessionAndGetProfile();

    expect(result).toBeNull();
  });

  test("when there are no cookies it should return null", async () => {
    const base = "https://prismic.io";

    jest.spyOn(fs, "lstatSync").mockImplementationOnce(() => ({} as fs.Stats));

    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(JSON.stringify({ base }));

    const result = await communication.validateSessionAndGetProfile(base);

    expect(result).toBeNull();
  });

  test("when network error it should return null", async () => {
    const fakeToken = "biscuits";
    const fakeCookie = `prismic-auth=${fakeToken}`;
    const fakeBase = "https://prismic.io";
    const email = "batman@example.com";
    const userId = "1234567";
    const type = "USER";
    const repositories = {
      "foo-repo": { dbid: "abcd", role: Utils.roles.Roles.OWNER },
      qwerty: { dbid: "efgh", role: Utils.roles.Roles.WRITER },
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
      .reply(403);

    const result = await communication.validateSessionAndGetProfile();
    expect(result).not.toBeNull();
    expect(result?.profile).toBeNull();
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
      "foo-repo": { dbid: "abcd", role: Utils.roles.Roles.OWNER },
      qwerty: { dbid: "efgh", role: Utils.roles.Roles.WRITER },
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

    const result = await communication.validateSessionAndGetProfile(fakeBase);

    expect(result).not.toBeNull();
    expect(result?.profile).not.toBeNull();

    expect(result?.info.email).toEqual(email);
    expect(result?.profile?.shortId).toEqual(shortId);
    expect(result?.profile?.userId).toEqual(userId);
  });
});
