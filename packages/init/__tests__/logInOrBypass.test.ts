import {
  describe,
  expect,
  test,
  jest,
  afterAll,
  afterEach,
} from "@jest/globals";
import { Utils, Auth } from "@slicemachine/core";
import { loginOrBypass } from "../src/steps/loginOrBypass";
import nock from "nock";
import * as fs from "fs";
import { stderr } from "stdout-stderr";
import * as path from "path";
import * as os from "os";

jest.mock("fs");

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  return nock.restore();
});

describe("loginOrBypass", () => {
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

  test("is should validate the session and get the users profile", async () => {
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

    stderr.start();
    const result = await loginOrBypass(fakeBase);
    stderr.stop();

    expect(result).not.toBeNull();
    expect(result?.info).not.toBeNull();
    expect(result?.profile).not.toBeNull();

    expect(result?.profile?.email).toEqual(email);
    expect(result?.profile?.shortId).toEqual(shortId);
    expect(result?.profile?.userId).toEqual(userId);

    expect(stderr.output).toContain(email);

    expect(fs.writeFileSync).toHaveBeenLastCalledWith(
      path.join(os.homedir(), ".prismic"),
      JSON.stringify({ base: fakeBase, cookies: fakeCookie, shortId }, null, 2),
      "utf8"
    );
  });

  test("user hasn't logged in for a few days", async () => {
    jest.spyOn(fs, "lstatSync").mockImplementation(() => ({} as fs.Stats));

    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValue(JSON.stringify({ cookies: fakeCookie, base: fakeBase }));

    nock("https://auth.prismic.io")
      .get(`/validate?token=${fakeToken}`)
      .reply(403);

    jest.spyOn(Auth, "login").mockResolvedValue();

    jest.spyOn(fs, "writeFileSync");

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

    const result = await loginOrBypass(fakeBase);

    expect(result).not.toBeNull();
    expect(result?.info).not.toBeNull();
    expect(result?.profile?.shortId).toEqual(shortId);
    expect(fs.writeFileSync).toBeCalledWith(
      path.join(os.homedir(), ".prismic"),
      JSON.stringify({ base: fakeBase, cookies: fakeCookie, shortId }, null, 2),
      "utf8"
    );
  });
});
