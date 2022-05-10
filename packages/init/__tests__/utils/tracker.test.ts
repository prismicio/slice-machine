import { expect, test } from "@jest/globals";
import "uuid";

import TrackerSingleton, { InitTracker } from "../../src/utils/tracker";
import { Models } from "@slicemachine/core";

type noop = () => void;
const MockTracker = jest.fn((_, cb: noop) => cb());
const MockIdentify = jest.fn().mockReturnThis();
jest.mock("analytics-node", () => {
  return jest.fn().mockImplementation(() => {
    return {
      track: MockTracker,
      identify: MockIdentify,
    };
  });
});
jest.mock("uuid", () => ({
  v4: () => "uuid",
}));

const dumpSegmentKey = "dumpSegmentKey";

describe("Tracker Singleton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("should init only one InitTracker instance", () => {
    const smTracker = TrackerSingleton.get();
    expect(smTracker).toBeInstanceOf(InitTracker);
    const smTracker2 = TrackerSingleton.get();
    expect(smTracker).toBe(smTracker2);
  });
});

describe("InitTracker", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should send a identify event", () => {
    const smTracker = new InitTracker();

    smTracker.initialize(dumpSegmentKey);
    smTracker.identifyUser("userId", "intercomHash");

    expect(MockIdentify).toHaveBeenCalledTimes(1);
    expect(MockIdentify).toHaveBeenCalledWith({
      anonymousId: "uuid",
      userId: "userId",
      integrations: {
        Intercom: {
          user_hash: "intercomHash",
        },
      },
    });
  });

  test("should send a track download lib event", async () => {
    const smTracker = new InitTracker();
    smTracker.initialize(dumpSegmentKey);
    // Anonymous call
    await smTracker.trackDownloadLibrary("libraryName");

    expect(MockTracker).toHaveBeenCalledTimes(1);

    expect(MockTracker.mock.calls[0][0]).toEqual({
      anonymousId: "uuid",
      event: "SliceMachine Download Library",
      properties: { library: "libraryName" },
    });

    smTracker.identifyUser("userId", "intercomHash");

    expect(MockIdentify).toHaveBeenCalledWith({
      anonymousId: "uuid",
      userId: "userId",
      integrations: {
        Intercom: {
          user_hash: "intercomHash",
        },
      },
    });

    // Logged in call
    await smTracker.trackDownloadLibrary("libraryName");

    expect(MockTracker).toHaveBeenCalledTimes(2);
    expect(MockTracker.mock.calls[1][0]).toEqual({
      userId: "userId",
      event: "SliceMachine Download Library",
      properties: { library: "libraryName" },
    });
  });

  test("should send a track init start event", async () => {
    const smTracker = new InitTracker();
    smTracker.initialize(dumpSegmentKey);
    // Anonymous call
    await smTracker.trackInitStart(undefined);

    expect(MockTracker).toHaveBeenCalledTimes(1);
    expect(MockTracker.mock.calls[0][0]).toEqual({
      anonymousId: "uuid",
      event: "SliceMachine Init Start",
      properties: {},
    });

    smTracker.identifyUser("userId", "intercomHash");

    expect(MockIdentify).toHaveBeenCalledTimes(1);
    expect(MockIdentify).toHaveBeenCalledWith({
      anonymousId: "uuid",
      userId: "userId",
      integrations: {
        Intercom: {
          user_hash: "intercomHash",
        },
      },
    });

    // Logged in call
    await smTracker.trackInitStart("repoName");

    expect(MockTracker).toHaveBeenCalledTimes(2);
    expect(MockTracker.mock.calls[1][0]).toEqual({
      userId: "userId",
      event: "SliceMachine Init Start",
      properties: {},
      context: {
        groupId: {
          Repository: "repoName",
        },
      },
    });
  });

  test("should send a track init identify event", async () => {
    const smTracker = new InitTracker();
    smTracker.initialize(dumpSegmentKey);
    // Anonymous call
    await smTracker.trackInitIdentify(undefined);

    expect(MockTracker).toHaveBeenCalledTimes(1);
    expect(MockTracker.mock.calls[0][0]).toEqual({
      anonymousId: "uuid",
      event: "SliceMachine Init Identify",
      properties: {},
    });

    smTracker.identifyUser("userId", "intercomHash");

    expect(MockIdentify).toHaveBeenCalledTimes(1);
    expect(MockIdentify).toHaveBeenCalledWith({
      anonymousId: "uuid",
      userId: "userId",
      integrations: {
        Intercom: {
          user_hash: "intercomHash",
        },
      },
    });

    // Logged in call
    await smTracker.trackInitIdentify("repoName");

    expect(MockTracker).toHaveBeenCalledTimes(2);
    expect(MockTracker.mock.calls[1][0]).toEqual({
      userId: "userId",
      event: "SliceMachine Init Identify",
      properties: {},
      context: {
        groupId: {
          Repository: "repoName",
        },
      },
    });
  });

  test("should send a track init done event", async () => {
    const smTracker = new InitTracker();
    smTracker.initialize(dumpSegmentKey);
    // Anonymous call
    await smTracker.trackInitDone(Models.Frameworks.next, "repoName");

    expect(MockTracker).toHaveBeenCalledTimes(1);
    expect(MockTracker.mock.calls[0][0]).toEqual({
      anonymousId: "uuid",
      event: "SliceMachine Init Done",
      properties: { framework: Models.Frameworks.next },
      context: { groupId: { Repository: "repoName" } },
    });

    smTracker.identifyUser("userId", "intercomHash");

    expect(MockIdentify).toHaveBeenCalledTimes(1);
    expect(MockIdentify).toHaveBeenCalledWith({
      anonymousId: "uuid",
      userId: "userId",
      integrations: {
        Intercom: {
          user_hash: "intercomHash",
        },
      },
    });

    // Logged in call
    await smTracker.trackInitDone(Models.Frameworks.next, "repoName");

    expect(MockTracker).toHaveBeenCalledTimes(2);
    expect(MockTracker.mock.calls[1][0]).toEqual({
      userId: "userId",
      event: "SliceMachine Init Done",
      properties: { framework: Models.Frameworks.next },
      context: { groupId: { Repository: "repoName" } },
    });
  });

  test("shouldn't send any events when tracker is disable", async () => {
    const smTracker = new InitTracker();
    smTracker.initialize(dumpSegmentKey, false);
    smTracker.identifyUser("userId", "intercomHash");
    await smTracker.trackInitDone(Models.Frameworks.next, "repoName");
    await smTracker.trackInitStart("repoName");
    await smTracker.trackInitIdentify("repoName");
    await smTracker.trackDownloadLibrary("libraryName");

    expect(MockIdentify).toHaveBeenCalledTimes(0);
    expect(MockTracker).toHaveBeenCalledTimes(0);
  });
});
