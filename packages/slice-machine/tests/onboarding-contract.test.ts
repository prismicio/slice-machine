import onboarding from "../server/src/api/tracking/onboarding";
import { TrackingEventId } from "@models/common/TrackingEvent";

let mockSendOnboarding = jest.fn(async () =>
  Promise.resolve({
    status: 200,
  })
);

const mockClient = jest.fn(() => ({
  sendOnboarding: mockSendOnboarding,
}))();

jest.mock(
  `../server/src/api/services/getEnv`,
  () => async () =>
    Promise.resolve({
      env: {
        client: mockClient,
      },
    })
);

describe("onboarding tracking", () => {
  test("it should return no error on 200 status from the tracking service", async () => {
    const result = await onboarding({
      id: TrackingEventId.ONBOARDING_START,
    });

    expect(result.err).toBeNull();
  });
});
