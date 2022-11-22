import MockedUserProfile from "../__mocks__/userProfile";
import MockedBackendEnv from "../__mocks__/backendEnvironment";
import { getAndSetUserProfile } from "../../server/src/api/services/getAndSetUserProfile";
import { vol } from "memfs";
import * as os from "os";
import { PrismicSharedConfig } from "@prismic-beta/slicemachine-core/build/models";
import nock from "nock";
import path from "path";

jest.mock(`fs`, () => {
  const { vol } = jest.requireActual("memfs");
  return vol;
});

describe("setShortId", () => {
  afterEach(() => {
    vol.reset();
    nock.cleanAll();
  });

  test("it should set the short ID and the intercom hash", async () => {
    const fakeCookie = "biscuits";
    const sharedConfig: PrismicSharedConfig = {
      base: "fakeBase",
      cookies: `prismic-auth=${fakeCookie}`,
    };
    vol.fromJSON(
      { ".prismic": JSON.stringify(sharedConfig, null, "\t") },
      os.homedir()
    );

    nock("https://user.internal-prismic.io")
      .get("/profile")
      .reply(200, JSON.stringify(MockedUserProfile));

    const res = await getAndSetUserProfile(MockedBackendEnv.client);
    expect(res).toEqual(MockedUserProfile);

    const newPrismicSharedConfig = vol
      .readFileSync(path.join(os.homedir(), ".prismic"))
      .toString();

    const expectedPrismicSharedConfig: PrismicSharedConfig = {
      ...sharedConfig,
      shortId: MockedUserProfile.shortId,
      intercomHash: MockedUserProfile.intercomHash,
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

    nock("https://user.internal-prismic.io").get("/profile").reply(200, {});

    await expect(getAndSetUserProfile(MockedBackendEnv.client)).rejects.toEqual(
      {
        message: "Unable to parse user profile: {}",
        status: 500,
      }
    );
  });

  test("on network issues should throw an error", async () => {
    const fakeCookie = "biscuits";
    const sharedConfig: PrismicSharedConfig = {
      base: "fakeBase",
      cookies: `prismic-auth=${fakeCookie}`,
    };
    vol.fromJSON(
      { ".prismic": JSON.stringify(sharedConfig, null, "\t") },
      os.homedir()
    );

    nock("https://user.internal-prismic.io").get("/profile").reply(403);

    await expect(getAndSetUserProfile(MockedBackendEnv.client)).rejects.toEqual(
      {
        message: "Unable to retrieve user profile with status code 403",
        status: 403,
      }
    );
  });
});
