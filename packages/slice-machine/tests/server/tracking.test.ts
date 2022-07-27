import { sendEvents } from "../../server/src/api/tracking";
import { EventNames } from "../../src/tracking/types";

import Analytics from "analytics-node";

const track = jest.fn().mockImplementation(() => Promise.resolve());
const identify = jest.fn().mockImplementation(() => Promise.resolve());
const group = jest.fn().mockImplementation(() => Promise.resolve());

const mockAnalytics = {
  track,
  identify,
  group,
} as unknown as Analytics;

jest.mock("uuid", () => {
  return {
    __esModule: true,
    v4: () => "uuid",
  };
});

describe("tracking", () => {
  describe("sendEvents", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("sends identify event", () => {
      sendEvents(
        mockAnalytics,
        { name: EventNames.IdentifyUser },
        "foo",
        "foo",
        "foo"
      );
      expect(identify).toHaveBeenCalled();
      expect(track).not.toHaveBeenCalled();
      expect(group).not.toHaveBeenCalled();
    });

    test("group", () => {
      sendEvents(
        mockAnalytics,
        {
          name: EventNames.GroupLibraries,
          props: {
            repoName: "foo",
            manualLibsCount: 0,
            downloadedLibsCount: 0,
            npmLibsCount: 0,
            downloadedLibs: [],
            slicemachineVersion: "0",
          },
        },
        "repoName"
      );
      expect(identify).not.toHaveBeenCalled();
      expect(group).toHaveBeenCalled();
      expect(track).not.toHaveBeenCalled();
    });

    test("track", () => {
      sendEvents(
        mockAnalytics,
        { name: EventNames.OnboardingContinueIntro },
        "repoName"
      );
      expect(identify).not.toHaveBeenCalled();
      expect(group).not.toHaveBeenCalled();
      expect(track).toHaveBeenCalledWith({
        anonymousId: "uuid",
        context: { groupId: { Repository: "repoName" } },
        event: "SliceMachine Onboarding Continue Screen Intro",
        properties: undefined,
      });
    });
  });
});
