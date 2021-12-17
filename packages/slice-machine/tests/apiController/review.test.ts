// We mock the getEnv service
jest.mock("../../server/src/api/services/getEnv");

import reviewHandler from "../../server/src/api/tracking/review";
import getEnv from "../../server/src/api/services/getEnv";

describe("review tracking controller", () => {
  test("it should return no error on 200 status from the tracking service", async () => {
    const onboardingResponse = {
      status: 200,
    };

    const mockSendReview = jest.fn(async () =>
      Promise.resolve(onboardingResponse)
    );

    getEnv.mockReturnValue(
      Promise.resolve({
        env: {
          framework: "nuxt",
          client: {
            sendReview: mockSendReview,
          },
        },
      })
    );

    const result = await reviewHandler({
      rating: 5,
      comment: "Super",
    });

    expect(mockSendReview).toHaveBeenCalledWith({
      framework: "nuxt",
      rating: 5,
      comment: "Super",
    });
    expect(result.status).toBe(200);
  });

  test("it should return no error on 500 status from the tracking service", async () => {
    const onboardingResponse = {
      status: 500,
    };

    const mockSendReview = jest.fn(async () =>
      Promise.resolve(onboardingResponse)
    );

    getEnv.mockReturnValue(
      Promise.resolve({
        env: {
          framework: "next",
          client: {
            sendReview: mockSendReview,
          },
        },
      })
    );

    const result = await reviewHandler({
      rating: 2,
      comment: "",
    });

    expect(mockSendReview).toHaveBeenCalledWith({
      framework: "next",
      rating: 2,
      comment: "",
    });
    expect(result.status).toBe(500);
  });
});
