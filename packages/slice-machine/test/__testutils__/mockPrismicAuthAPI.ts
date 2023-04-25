import { TestContext } from "vitest";
import { rest } from "msw";

type MockPrismicAuthAPIConfig = {
  endpoint?: string;
  validateEndpoint?: {
    isValid?: boolean;
  };
  refreshtokenEndpoint?: {
    isSuccessful?: boolean;
    refreshedToken?: string;
  };
};

type MockPrismicUserAPIReturnType = {
  refreshedToken: string;
};

export const mockPrismicAuthAPI = (
  ctx: TestContext,
  config?: MockPrismicAuthAPIConfig
): MockPrismicUserAPIReturnType => {
  const endpoint = config?.endpoint ?? "https://auth.prismic.io/";

  const validateEndpointConfig = {
    isValid: true,
    ...(config?.validateEndpoint || {}),
  };

  const refreshtokenEndpointConfig = {
    isSuccessful: true,
    refreshedToken: "refreshed-token",
    ...(config?.refreshtokenEndpoint || {}),
  };

  ctx.msw.use(
    rest.get(new URL("./validate", endpoint).toString(), (_req, res, ctx) => {
      if (validateEndpointConfig.isValid) {
        return res();
      } else {
        return res(ctx.status(401));
      }
    }),
    rest.get(
      new URL("./refreshtoken", endpoint).toString(),
      (_req, res, ctx) => {
        if (refreshtokenEndpointConfig.isSuccessful) {
          return res(ctx.text(refreshtokenEndpointConfig.refreshedToken));
        } else {
          return res(ctx.status(401));
        }
      }
    )
  );

  return {
    refreshedToken: refreshtokenEndpointConfig.refreshedToken,
  };
};
