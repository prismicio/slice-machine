import axios from "axios";
import * as t from "io-ts";
import { pipe } from "fp-ts/function";
import { fold } from "fp-ts/Either";
import { Utils, Models, CONSTS } from "@slicemachine/core";
import * as Prismic from "@slicemachine/core/build/prismic";

export async function getUserProfile(
  cookies: string,
  base = CONSTS.DEFAULT_BASE
): Promise<Models.UserProfile> {
  const userServiceBase =
    CONSTS.DEFAULT_BASE === base
      ? CONSTS.USER_SERVICE_BASE
      : CONSTS.USER_SERVICE_STAGING_BASE;

  // note the auth server also provides a userId
  const url = new URL(userServiceBase);
  url.pathname = "profile";

  const endpoint = url.toString();
  const token = Utils.Cookie.parsePrismicAuthToken(cookies);

  return axios
    .get<Models.UserProfile>(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) =>
      pipe(
        Models.UserProfile.decode(res.data),
        fold<t.Errors, Models.UserProfile, Models.UserProfile>(
          () => {
            throw new Error("Can't parse user profile");
          },
          (data: Models.UserProfile) => data
        )
      )
    );
}

export async function validateSessionAndGetProfile(
  base = CONSTS.DEFAULT_BASE
): Promise<{
  info: Models.UserInfo;
  profile: Models.UserProfile | null;
} | null> {
  const config = Prismic.PrismicSharedConfigManager.get();

  if (!config.cookies.length) return Promise.resolve(null); // default config, logged out.
  if (base != config.base) return Promise.resolve(null); // not the same base so it doesn't

  try {
    const info = await Prismic.Communication.validateSession(
      config.cookies,
      base
    );
    const profile = await getUserProfile(config.cookies, base).catch(
      () => null
    );
    if (profile?.shortId) {
      Prismic.PrismicSharedConfigManager.setProperties({
        shortId: profile.shortId,
      });
    }
    return { info, profile };
  } catch {
    return null;
  }
}
