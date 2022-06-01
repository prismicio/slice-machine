import MockedUserProfile from "../__mocks__/userProfile";
import MockedBackendEnv from "../__mocks__/backendEnvironment";
import { getAndSetUserProfile } from "../../server/src/api/services/getAndSetUserProfile";
import { vol } from "memfs";
import * as os from "os";
import { PrismicSharedConfig } from "@slicemachine/core/build/models";
import fetchMock from "fetch-mock";
import path from "path";

jest.mock(`fs`, () => {
  const { vol } = jest.requireActual("memfs");
  return vol;
});

describe("setShortId", () => {
  afterEach(() => {
    vol.reset();
    fetchMock.reset();
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

    fetchMock.getOnce("https://user.internal-prismic.io/profile", {
      status: 200,
      body: JSON.stringify(MockedUserProfile),
    });

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

    fetchMock.getOnce("https://user.internal-prismic.io/profile", {
      status: 200,
      body: {},
    });

    await expect(getAndSetUserProfile(MockedBackendEnv.client)).rejects.toEqual(
      "Unable to parse profile: {}"
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

    fetchMock.getOnce("https://user.internal-prismic.io/profile", {
      status: 403,
    });

    await expect(getAndSetUserProfile(MockedBackendEnv.client)).rejects.toEqual(
      "Unable to retrieve profile with status code 403"
    );
  });
});
