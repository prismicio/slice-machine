import MockedUserProfile from "../__mocks__/userProfile";
import MockedBackendEnv from "../__mocks__/backendEnvironment";
import { getAndSetUserProfile } from "../../server/src/api/services/getAndSetUserProfile";
import { vol } from "memfs";
import * as os from "os";
import { PrismicSharedConfig } from "@slicemachine/core/build/models";
import nock from "nock";
import path from "path";
import { FetchMock } from "../__mocks__/fetchMock";

jest.mock(`fs`, () => {
  const { vol } = jest.requireActual("memfs");
  return vol;
});

describe("setShortId", () => {
  afterEach(() => {
    vol.reset();
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

    FetchMock(
      "https://user.internal-prismic.io/profile",
      200,
      MockedUserProfile
    );

    const res = await getAndSetUserProfile(MockedBackendEnv);
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

    FetchMock("https://user.internal-prismic.io/profile", 200, {});

    await expect(getAndSetUserProfile(MockedBackendEnv)).rejects.toEqual(
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

    FetchMock("https://user.internal-prismic.io/profile", 500);

    await expect(getAndSetUserProfile(MockedBackendEnv)).rejects.toEqual(
      "Unable to retrieve profile with status code 500"
    );
  });
});
