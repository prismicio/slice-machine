import nock from "nock";
import fs from "fs";
import onboarding from "../server/src/api/tracking/onboarding";
import { name } from "../package.json";
import fetch from "node-fetch";

global.fetch = fetch; // not good :/

/**
 * USE ACTUAL EMAIL PASSWORD AND REPO_URL
 */
const { EMAIL, PASSWORD, REPO_URL } = process.env;
const contract = EMAIL && PASSWORD && REPO_URL ? describe : describe.skip;

const login = (email = EMAIL, password = PASSWORD) =>
  fetch("https://auth.wroom.io/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }).then((res) => res.text());

contract("contract: onboarding tracking", () => {
  jest.setTimeout(60 * 1000);
  test("it should successfully send onboarding info to wroom", async () => {
    const authToken = await login(EMAIL, PASSWORD);
    const base = "https://wroom.io";
    const cookies = `prismic-auth=${authToken};`;
    const repoUrl = new URL(process.env.REPO_URL);
    repoUrl.pathname = "/api/v2";
    const version = "0.0.0";
    const apiEndpoint = repoUrl.toString();

    const readFileSync = jest.spyOn(fs, "readFileSync");
    const lstat = jest.spyOn(fs, "lstatSync");
    lstat.mockReturnValueOnce(true);
    readFileSync.mockReturnValueOnce(JSON.stringify({ base, cookies }));
    lstat.mockReturnValueOnce(true);
    readFileSync.mockReturnValueOnce(JSON.stringify({ version, name }));

    nock("https://unpkg.com")
      .get(`/${name}/package.json`)
      .reply(200, { version });

    lstat.mockReturnValueOnce(true);
    const existsSync = jest.spyOn(fs, "existsSync");
    existsSync.mockReturnValueOnce(true);
    readFileSync.mockReturnValueOnce(
      JSON.stringify({ apiEndpoint: repoUrl.toString() })
    );

    const now = Date.now();

    const result = await onboarding({
      id: "slicemachine_onboarding_start",
      time: now,
    });

    expect(result.err).toBeNull();
  });
});
