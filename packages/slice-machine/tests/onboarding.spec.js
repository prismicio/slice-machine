import nock from "nock";
import fs from "fs";
import onboarding from "../server/src/api/tracking/onboarding";
import { name } from "../package.json";
import { TrackingEventId } from "../lib/models/common/TrackingEvent";
import fetch from "node-fetch";

global.fetch = fetch; // not good :/

describe("tracking/onboarding", () => {
  test("it should post the onboarding data to the tracking endpoint", async () => {
    const lstat = jest.spyOn(fs, "lstatSync");
    lstat.mockReturnValueOnce(true);

    const readFileSync = jest.spyOn(fs, "readFileSync");

    lstat.mockReturnValueOnce(true);
    const existsSync = jest.spyOn(fs, "existsSync");
    existsSync.mockReturnValueOnce(true);

    readFileSync.mockReturnValueOnce(
      JSON.stringify({
        apiEndpoint: "https://fake.prismic.io/api/v2",
      })
    );

    const base = "https://prismic.io";
    const cookies = "SESSION=abd; prismic-auth=xyz";
    readFileSync.mockReturnValueOnce(JSON.stringify({ base, cookies }));

    const version = "0.0.0";
    readFileSync.mockReturnValueOnce(JSON.stringify({ version, name }));
    nock("https://unpkg.com")
      .get(`/${name}/package.json`)
      .reply(200, { version });

    nock("https://tracking.prismic.io")
      .post("/", (body) => body.id === TrackingEventId.ONBOARDING_START)
      .reply(201);

    const result = await onboarding({
      id: TrackingEventId.ONBOARDING_START,
    });

    expect(result.err).toBeNull();
  });
});
