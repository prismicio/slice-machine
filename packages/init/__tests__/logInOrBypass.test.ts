import {
  describe,
  expect,
  test,
  jest,
  afterAll,
  afterEach,
} from "@jest/globals";
import { ApplicationMode } from "@slicemachine/client";
import { loginOrBypass } from "../src/steps/loginOrBypass";
import nock from "nock";
import * as fs from "fs";
import { stderr } from "stdout-stderr";

import { Auth, Client } from "../src/utils";

jest.mock("fs");

const fakeToken = "biscuits";
Client.initialize(ApplicationMode.PROD, fakeToken);

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  return nock.restore();
});

describe("loginOrBypass", () => {
  const fakeCookie = `prismic-auth=${fakeToken}`;
  const fakeBase = "https://prismic.io";

  const firstName = "bat";
  const lastName = "man";
  const email = "batman@example.com";
  const userId = "1234567";
  const shortId = "12";
  const intercomHash = "intercomHash";

  test("it should validate the session and get the users profile", async () => {
    jest.spyOn(fs, "lstatSync").mockImplementation(() => ({} as fs.Stats));
    jest.spyOn(fs, "writeFileSync");

    // calling profile route
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

    stderr.start();
    const result = await loginOrBypass();
    stderr.stop();

    // profile should be defined
    expect(result).not.toBeNull();
    expect(result.email).toEqual(email);
    expect(result.shortId).toEqual(shortId);
    expect(result.intercomHash).toEqual(intercomHash);
    expect(result.userId).toEqual(userId);

    expect(stderr.output).toContain(email);
  });

  test("it should consider the session invalid and ask the user to login", async () => {
    jest.spyOn(fs, "lstatSync").mockImplementation(() => ({} as fs.Stats));

    // calling profile route
    nock("https://user.internal-prismic.io")
      .matchHeader("Authorization", `Bearer ${fakeToken}`)
      .get("/profile")
      .reply(403);

    jest.spyOn(Auth, "login").mockResolvedValue();

    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(
        JSON.stringify({ cookies: fakeCookie, base: fakeBase })
      );

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

    const result = await loginOrBypass();

    expect(result).not.toBeNull();
    expect(result.email).toEqual(email);
    expect(result.shortId).toEqual(shortId);
    expect(result.intercomHash).toEqual(intercomHash);
    expect(result.userId).toEqual(userId);
  });
});
