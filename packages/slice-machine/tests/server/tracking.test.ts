import { describe, beforeEach, test, expect } from "@jest/globals";
import handler, { sendEvents } from "../../server/src/api/tracking";
import { EventNames } from "../../src/tracking/types";
import * as Analytics from "../../server/src/api/services/analytics";
import { RequestWithEnv } from "server/src/api/http/common";

jest.mock("../../server/src/api/services/analytics", () => {
  return {
    __esModule: true,
    track: jest.fn().mockImplementation(() => Promise.resolve()),
    identify: jest.fn().mockImplementation(() => Promise.resolve()),
    group: jest.fn().mockImplementation(() => Promise.resolve()),
  };
});

jest.mock("uuid", () => {
  return {
    __esModule: true,
    v4: jest.fn().mockReturnValueOnce("uuid").mockReturnValue("bad"),
  };
});

describe("tracking", () => {
  describe("sendEvents", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("sends identify event", () => {
      sendEvents({ name: EventNames.IdentifyUser }, "foo", "foo", "foo");
      expect(Analytics.identify).toHaveBeenCalledWith({
        integrations: {
          Intercom: {
            user_hash: "foo",
          },
        },
        userId: "foo",
      });
      expect(Analytics.track).not.toHaveBeenCalled();
      expect(Analytics.group).not.toHaveBeenCalled();
    });

    test("identify event should not be sent when userId or repo-name is undefined", () => {
      sendEvents({ name: EventNames.IdentifyUser }, "foo");
      expect(Analytics.identify).not.toHaveBeenCalled();
      expect(Analytics.track).not.toHaveBeenCalled();
      expect(Analytics.group).not.toHaveBeenCalled();
    });

    test("group", () => {
      sendEvents(
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
      expect(Analytics.identify).not.toHaveBeenCalled();
      expect(Analytics.group).toHaveBeenCalledWith({
        anonymousId: "uuid",
        groupId: "foo",
        traits: {
          downloadedLibs: [],
          downloadedLibsCount: 0,
          manualLibsCount: 0,
          npmLibsCount: 0,
          repoName: "foo",
          slicemachineVersion: "0",
        },
      });
      expect(Analytics.track).not.toHaveBeenCalled();
    });

    test("track", () => {
      sendEvents({ name: EventNames.OnboardingContinueIntro }, "repoName");
      expect(Analytics.identify).not.toHaveBeenCalled();
      expect(Analytics.group).not.toHaveBeenCalled();
      expect(Analytics.track).toHaveBeenCalledWith({
        anonymousId: "uuid",
        context: { groupId: { Repository: "repoName" } },
        event: "SliceMachine Onboarding Continue Screen Intro",
        properties: undefined,
      });
    });
  });

  describe("handler", () => {
    test("it should not send events if sm.json.tracking is set to false", async () => {
      const req = {
        body: { name: EventNames.OnboardingContinueScreen3 },
        env: {
          manifest: {
            repo: "foo",
            tracking: false,
          },
        },
      } as unknown as RequestWithEnv;

      await handler(req);

      expect(Analytics.identify).not.toHaveBeenCalled();
      expect(Analytics.track).not.toHaveBeenCalled();
      expect(Analytics.group).not.toHaveBeenCalled();
    });

    test("it should send events if tracking is not disabled", async () => {
      const req = {
        body: { name: EventNames.OnboardingContinueScreen3 },
        env: {
          manifest: {
            repo: "foo",
          },
          prismicData: {},
        },
      } as unknown as RequestWithEnv;

      await handler(req);

      expect(Analytics.identify).not.toHaveBeenCalled();
      expect(Analytics.track).toHaveBeenCalledWith({
        anonymousId: "uuid",
        context: {
          groupId: {
            Repository: undefined,
          },
        },
        event: "SliceMachine Onboarding Continue Screen 3",
        properties: undefined,
      });
      expect(Analytics.group).not.toHaveBeenCalled();
    });
  });
});
