import MockedUserProfile from "../__mockData__/userProfile";
import MockedBackendEnv from "../__mockData__/envBackend";
import { setShortId } from "../../server/src/api/services/setShortId";
import { vol } from "memfs";
import * as os from "os";
import { PrismicSharedConfig } from "@slicemachine/core/build/src/models";
import nock from "nock";
import path from "path";

jest.mock(`fs`, () => {
  const { vol } = jest.requireActual("memfs");
  return vol;
});

describe("setShortId", () => {
  afterEach(() => {
    vol.reset();
  });

  test("it should set the short ID", async () => {
    const fakeCookie = "biscuits";
    const sharedConfig: PrismicSharedConfig = {
      base: "fakeBase",
      cookies: `prismic-auth=${fakeCookie}`,
    };
    vol.fromJSON(
      { ".prismic": JSON.stringify(sharedConfig, null, "\t") },
      os.homedir()
    );

    nock("https://user.internal-prismic.io/", {
      reqheaders: { Authorization: `Bearer ${fakeCookie}` },
    })
      .get("/profile")
      .reply(200, JSON.stringify(MockedUserProfile));

    const res = await setShortId(MockedBackendEnv, fakeCookie);
    expect(res instanceof Error).toBe(false);
    expect(res).toEqual(MockedUserProfile);

    const newPrismicSharedConfig = vol
      .readFileSync(path.join(os.homedir(), ".prismic"))
      .toString();

    const expectedPrismicSharedConfig: PrismicSharedConfig = {
      ...sharedConfig,
      shortId: MockedUserProfile.shortId,
    };
    expect(JSON.parse(newPrismicSharedConfig)).toEqual(
      expectedPrismicSharedConfig
    );
  });

  test("it should return an error", async () => {
    const fakeCookie = "biscuits";
    const sharedConfig: PrismicSharedConfig = {
      base: "fakeBase",
      cookies: `prismic-auth=${fakeCookie}`,
    };
    vol.fromJSON(
      { ".prismic": JSON.stringify(sharedConfig, null, "\t") },
      os.homedir()
    );

    nock("https://user.internal-prismic.io/", {
      reqheaders: { Authorization: `Bearer ${fakeCookie}` },
    })
      .get("/profile")
      .reply(403);

    const res = await setShortId(MockedBackendEnv, fakeCookie);
    expect(res instanceof Error).toBe(true);
    expect((res as Error).message).toBe("Request failed with status code 403");
  });
});
