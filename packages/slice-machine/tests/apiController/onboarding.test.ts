// We mock the getEnv service
jest.mock("../../server/src/api/services/getEnv");

import onboarding from "../../server/src/api/tracking/onboarding";
import { TrackingEventId } from "@models/common/TrackingEvent";
import getEnv from "../../server/src/api/services/getEnv";

describe("onboarding tracking controller", () => {
  test("it should return no error on 200 status from the tracking service", async () => {
    const onboardingResponse = {
      status: 200,
    };

    const mockSendOnboarding = jest.fn(async () =>
      Promise.resolve(onboardingResponse)
    );

    getEnv.mockReturnValue(
      Promise.resolve({
        env: {
          client: {
            sendOnboarding: mockSendOnboarding,
          },
        },
      })
    );

    const result = await onboarding({
      id: TrackingEventId.ONBOARDING_START,
    });

    expect(mockSendOnboarding).toHaveBeenCalledWith({
      id: TrackingEventId.ONBOARDING_START,
    });
    expect(result.err).toBeNull();
  });

  test("it should return no error on 500 status from the tracking service", async () => {
    const onboardingResponse = {
      status: 500,
    };

    const mockSendOnboarding = jest.fn(async () =>
      Promise.resolve(onboardingResponse)
    );

    getEnv.mockReturnValue(
      Promise.resolve({
        env: {
          client: {
            sendOnboarding: mockSendOnboarding,
          },
        },
      })
    );

    const result = await onboarding({
      id: TrackingEventId.ONBOARDING_START,
    });

    expect(mockSendOnboarding).toHaveBeenCalledWith({
      id: TrackingEventId.ONBOARDING_START,
    });
    expect(result.err).toEqual(onboardingResponse);
  });
});
