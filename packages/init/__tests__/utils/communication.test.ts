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
import * as path from "path";
import * as os from "os";
import { Models } from "@slicemachine/core";
import * as communication from "../../src/utils/communication";

jest.mock("fs");

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  return nock.restore();
});

describe("communication.getUserPrfile", () => {
  test("when called with cookies it should fetch the user profile form 'https://user.internal-prismic.io/profile`", async () => {
    const token = "biscuits";
    const cookie = `prismic-auth=${token}`;

    nock("https://user.internal-prismic.io")
      .matchHeader("Authorization", `Bearer ${token}`)
      .get("/profile")
      .reply(200, {
        userId: "1234",
        shortId: "12",
        intercomHash: "intercomHash",
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

    nock("https://user.internal-prismic.io")
      .matchHeader("Authorization", `Bearer ${token}`)
      .get("/profile")
      .reply(200, {});

    await expect(() =>
      communication.getUserProfile(cookie)
    ).rejects.toThrowError("Can't parse user profile");
  });
});

describe("communication.validateSessionAndGetProfile", () => {
  const fakeToken = "biscuits";
  const fakeCookie = `prismic-auth=${fakeToken}`;
  const fakeBase = "https://prismic.io";

  const firstName = "bat";
  const lastName = "man";
  const email = "batman@example.com";
  const userId = "1234567";
  const shortId = "12";
  const intercomHash = "intercomHash";
  const type = "USER";
  const repositories = {
    "foo-repo": { dbid: "abcd", role: Models.Roles.OWNER },
    qwerty: { dbid: "efgh", role: Models.Roles.WRITER },
  };

  test("if base does not match the base in the config it should return null", async () => {
    jest.spyOn(fs, "lstatSync").mockImplementation(() => ({} as fs.Stats));

    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(
        JSON.stringify({ cookies: fakeCookie, base: fakeBase })
      );

    const result = await communication.validateSessionAndGetProfile();

    expect(result).toBeNull();
  });

  test("when there are no cookies it should return null", async () => {
    jest.spyOn(fs, "lstatSync").mockImplementationOnce(() => ({} as fs.Stats));

    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValue(JSON.stringify({ base: fakeBase }));

    const result = await communication.validateSessionAndGetProfile(fakeBase);

    expect(result).toBeNull();
  });

  test("when network error it should return null", async () => {
    jest.spyOn(fs, "lstatSync").mockImplementation(() => ({} as fs.Stats));
    jest.spyOn(fs, "writeFileSync");

    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValue(JSON.stringify({ cookies: fakeCookie, base: fakeBase }));

    nock("https://auth.prismic.io")
      .get(`/validate?token=${fakeToken}`)
      .reply(200, {
        userId,
        email,
        type,
        repositories,
      });

    nock("https://user.internal-prismic.io")
      .matchHeader("Authorization", `Bearer ${fakeToken}`)
      .get("/profile")
      .reply(403);

    const result = await communication.validateSessionAndGetProfile();
    expect(result).not.toBeNull();
    expect(result?.profile).toBeNull();
  });

  test("it should validate the session and get the users profile", async () => {
    jest.spyOn(fs, "lstatSync").mockImplementation(() => ({} as fs.Stats));
    jest.spyOn(fs, "writeFileSync");

    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValue(JSON.stringify({ cookies: fakeCookie, base: fakeBase }));

    nock("https://auth.prismic.io")
      .get(`/validate?token=${fakeToken}`)
      .reply(200, {
        userId,
        email,
        type,
        repositories,
      });

    nock("https://user.internal-prismic.io")
      .matchHeader("Authorization", `Bearer ${fakeToken}`)
      .get("/profile")
      .reply(200, {
        userId,
        shortId,
        intercomHash,
        email,
        firstName,
        lastName,
      });

    const result = await communication.validateSessionAndGetProfile(fakeBase);

    expect(result).not.toBeNull();
    expect(result?.profile).not.toBeNull();

    expect(result?.info.email).toEqual(email);
    expect(result?.profile?.shortId).toEqual(shortId);
    expect(result?.profile?.intercomHash).toEqual(intercomHash);
    expect(result?.profile?.userId).toEqual(userId);

    expect(fs.writeFileSync).toHaveBeenLastCalledWith(
      path.join(os.homedir(), ".prismic"),
      JSON.stringify(
        { base: fakeBase, cookies: fakeCookie, shortId, intercomHash },
        null,
        2
      ),
      "utf8"
    );
  });
});
