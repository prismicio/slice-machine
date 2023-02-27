import { describe, test, expect } from "@jest/globals";

import nock from "nock";
import tracker from "../../src/utils/tracker";
import noop from "../../src/utils/noop";

jest.mock("../../src/utils/noop", () => {
  return {
    __esModule: true,
    default: jest.fn(() => void 0),
  };
});
const mockedNoop = jest.mocked(noop);

describe("Tracker errors", () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });

  test("if the network is blocked, it should not throw an unhandled error", async () => {
    const networkSpy = jest.fn().mockReturnValue(true);

    nock("https://api.segment.io")
      .persist()
      .post("/v1/batch", networkSpy)
      .replyWithError({
        port: 443,
        address: "0.0.0.0",
        syscall: "connect",
        code: "ECONNREFUSED",
        errno: -61,
      });

    tracker.get().initialize("❔");

    await tracker.get().trackInitStart("🙀");

    await new Promise((resolve) => process.nextTick(resolve));

    expect(networkSpy).toHaveBeenCalled();
    expect(mockedNoop).toHaveBeenCalled();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });
});
