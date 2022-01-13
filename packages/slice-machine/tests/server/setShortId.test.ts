import MockedUserProfile from "../__mockData__/userProfile";
import MockedBackendEnv from "../__mockData__/envBackend";
import { setShortId } from "../../server/src/api/services/setShortId";
import { vol } from "memfs";
import * as os from "os";
import { PrismicSharedConfig } from "@slicemachine/core/build/src/models";

const mockedUpdateProfile = jest.fn();
jest.mock("@lib/models/common/http/DefaultClient", () => {
  const actualClient = jest.requireActual(
    "@lib/models/common/http/DefaultClient"
  );

  return {
    ...actualClient,
    profile: () => mockedUpdateProfile(),
  };
});

jest.mock(`fs`, () => {
  const { vol } = jest.requireActual("memfs");
  return vol;
});

describe("setShortId", () => {
  afterEach(() => {
    vol.reset();
  });

  test("it should set the short ID", async () => {
    const sharedConfig: PrismicSharedConfig = { base: "fakeBase", cookies: "" };
    vol.fromJSON(
      { ".prismic": JSON.stringify(sharedConfig, null, "\t") },
      os.homedir()
    );
    mockedUpdateProfile.mockResolvedValue(MockedUserProfile);

    const res = await setShortId(MockedBackendEnv, "fakeToken");
    expect(res instanceof Error).toBe(false);
    expect(res).toEqual(MockedUserProfile);

    const newPrismicSharedConfig = vol
      .readFileSync(`${os.homedir()}/.prismic`)
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
    const errorMessage = "fakeErrorMessage";
    mockedUpdateProfile.mockResolvedValue(new Error(errorMessage));

    const res = await setShortId(MockedBackendEnv, "fakeToken");
    expect(res instanceof Error).toBe(true);
    expect((res as Error).message).toBe(errorMessage);
  });
});
