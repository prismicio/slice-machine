import { TestContext } from "vitest";
import { rest } from "msw";

import { PrismicUserProfile } from "@slicemachine/manager";

type MockPrismicUserAPIConfig = {
  endpoint?: string;
  profileEndpoint?:
    | false
    | {
        profile?: Partial<PrismicUserProfile>;
        isValid?: boolean;
      };
  repositoriesEndpoint?:
    | false
    | {
        isSuccessful: false;
        expectedAuthenticationToken?: never;
        expectedCookies?: never;
        repositories?: never;
      }
    | {
        isSuccessful?: true;
        expectedAuthenticationToken: string;
        expectedCookies: string[];
        repositories: {
          domain: string;
          name: string;
          role: string;
        }[];
      };
};

type MockPrismicUserAPIReturnType = {
  profile: PrismicUserProfile;
};

export const mockPrismicUserAPI = (
  ctx: TestContext,
  config?: MockPrismicUserAPIConfig
): MockPrismicUserAPIReturnType => {
  const endpoint = config?.endpoint ?? "https://user.internal-prismic.io/";

  const profile: PrismicUserProfile = {
    userId: "userId",
    shortId: "shortId",
    intercomHash: "intercomHash",
    email: "email",
    firstName: "firstName",
    lastName: "lastName",
    ...(config?.profileEndpoint === false
      ? {}
      : config?.profileEndpoint?.profile),
  };

  if (config?.profileEndpoint !== false) {
    ctx.msw.use(
      rest.get(new URL("./profile", endpoint).toString(), (_req, res, ctx) => {
        if (
          (config?.profileEndpoint && config.profileEndpoint.isValid) ??
          true
        ) {
          return res(ctx.json(profile));
        } else {
          return res(ctx.status(401));
        }
      })
    );
  }

  if (config?.repositoriesEndpoint) {
    ctx.msw.use(
      rest.get(
        new URL("./repositories", endpoint).toString(),
        (req, res, ctx) => {
          if (
            config.repositoriesEndpoint !== false &&
            (config.repositoriesEndpoint?.isSuccessful === true ||
              config.repositoriesEndpoint?.isSuccessful === undefined) &&
            req.headers.get("Authorization") ===
              `Bearer ${config.repositoriesEndpoint?.expectedAuthenticationToken}` &&
            req.headers.get("Cookie") ===
              config.repositoriesEndpoint?.expectedCookies.join("; ") &&
            req.headers.get("User-Agent") === "slice-machine"
          ) {
            return res(ctx.json(config.repositoriesEndpoint?.repositories));
          } else {
            return res(ctx.json({}), ctx.status(401));
          }
        }
      )
    );
  }

  return {
    profile,
  };
};
