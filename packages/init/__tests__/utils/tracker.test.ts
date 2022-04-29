import { expect, test } from "@jest/globals";
import ServerAnalytics from "analytics-node";
import "uuid";

import TrackerSingleton, { InitTracker } from "../../src/utils/tracker";
import { Models } from "@slicemachine/core";

jest.mock("analytics-node");
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
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.identify).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.identify).toHaveBeenCalledWith({
      anonymousId: "uuid",
      userId: "userId",
      integrations: {
        Intercom: {
          user_hash: "intercomHash",
        },
      },
    });
  });

  test("should send a track download lib event", () => {
    const smTracker = new InitTracker();
    smTracker.initialize(dumpSegmentKey);
    // Anonymous call
    smTracker.trackDownloadLibrary("libraryName");

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.track).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.track).toHaveBeenCalledWith({
      anonymousId: "uuid",
      event: "SliceMachine Download Library",
      properties: { library: "libraryName" },
    });

    smTracker.identifyUser("userId", "intercomHash");

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.identify).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.identify).toHaveBeenCalledWith({
      anonymousId: "uuid",
      userId: "userId",
      integrations: {
        Intercom: {
          user_hash: "intercomHash",
        },
      },
    });

    // Logged in call
    smTracker.trackDownloadLibrary("libraryName");

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.track).toHaveBeenCalledTimes(2);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.track).toHaveBeenCalledWith({
      userId: "userId",
      event: "SliceMachine Download Library",
      properties: { library: "libraryName" },
    });
  });

  test("should send a track init start event", () => {
    const smTracker = new InitTracker();
    smTracker.initialize(dumpSegmentKey);
    // Anonymous call
    smTracker.trackInitStart(undefined);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.track).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.track).toHaveBeenCalledWith({
      anonymousId: "uuid",
      event: "SliceMachine Init Start",
      properties: {},
    });

    smTracker.identifyUser("userId", "intercomHash");

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.identify).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.identify).toHaveBeenCalledWith({
      anonymousId: "uuid",
      userId: "userId",
      integrations: {
        Intercom: {
          user_hash: "intercomHash",
        },
      },
    });

    // Logged in call
    smTracker.trackInitStart("repoName");

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.track).toHaveBeenCalledTimes(2);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.track).toHaveBeenCalledWith({
      userId: "userId",
      event: "SliceMachine Init Start",
      properties: {
        repo: "repoName",
      },
    });
  });

  test("should send a track init identify event", () => {
    const smTracker = new InitTracker();
    smTracker.initialize(dumpSegmentKey);
    // Anonymous call
    smTracker.trackInitIdentify(undefined);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.track).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.track).toHaveBeenCalledWith({
      anonymousId: "uuid",
      event: "SliceMachine Init Identify",
      properties: {},
    });

    smTracker.identifyUser("userId", "intercomHash");

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.identify).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.identify).toHaveBeenCalledWith({
      anonymousId: "uuid",
      userId: "userId",
      integrations: {
        Intercom: {
          user_hash: "intercomHash",
        },
      },
    });

    // Logged in call
    smTracker.trackInitIdentify("repoName");

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.track).toHaveBeenCalledTimes(2);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.track).toHaveBeenCalledWith({
      userId: "userId",
      event: "SliceMachine Init Identify",
      properties: {
        repo: "repoName",
      },
    });
  });

  test("should send a track init done event", () => {
    const smTracker = new InitTracker();
    smTracker.initialize(dumpSegmentKey);
    // Anonymous call
    smTracker.trackInitDone(Models.Frameworks.next, "repoName");

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.track).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.track).toHaveBeenCalledWith({
      anonymousId: "uuid",
      event: "SliceMachine Init Done",
      properties: { framework: Models.Frameworks.next, repo: "repoName" },
    });

    smTracker.identifyUser("userId", "intercomHash");

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.identify).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.identify).toHaveBeenCalledWith({
      anonymousId: "uuid",
      userId: "userId",
      integrations: {
        Intercom: {
          user_hash: "intercomHash",
        },
      },
    });

    // Logged in call
    smTracker.trackInitDone(Models.Frameworks.next, "repoName");

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.track).toHaveBeenCalledTimes(2);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.track).toHaveBeenCalledWith({
      userId: "userId",
      event: "SliceMachine Init Done",
      properties: { framework: Models.Frameworks.next, repo: "repoName" },
    });
  });

  test("shouldn't send any events when tracker is disable", () => {
    const smTracker = new InitTracker();
    smTracker.initialize(dumpSegmentKey, false);
    smTracker.identifyUser("userId", "intercomHash");
    smTracker.trackInitDone(Models.Frameworks.next, "repoName");
    smTracker.trackInitStart("repoName");
    smTracker.trackInitIdentify("repoName");
    smTracker.trackDownloadLibrary("libraryName");

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.identify).toHaveBeenCalledTimes(0);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ServerAnalytics.prototype.track).toHaveBeenCalledTimes(0);
  });
});
