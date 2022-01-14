import axios from "axios";
import * as t from "io-ts";
import { pipe } from "fp-ts/function";
import { fold } from "fp-ts/Either";
import { Utils, Communication, FileSystem } from "@slicemachine/core";

const UserProfile = t.exact(
  t.type({
    userId: t.string,
    shortId: t.string,
    email: t.string,
    firstName: t.string,
    lastName: t.string,
  })
);

export type UserProfile = t.TypeOf<typeof UserProfile>;

export async function getUserProfile(
  cookies: string,
  base = Utils.CONSTS.DEFAULT_BASE
): Promise<UserProfile> {
  // note the auth server also provides a userId

  const url = new URL(base);
  url.hostname = `user.${url.hostname}`;
  url.pathname = "profile";

  const endpoint = url.toString();
  const token = Utils.Cookie.parsePrismicAuthToken(cookies);

  return axios
    .get<UserProfile>(endpoint, {
      headers: {
        Authorization: `Bearer Token ${token}`,
      },
    })
    .then((res) =>
      pipe(
        UserProfile.decode(res.data),
        fold<t.Errors, UserProfile, UserProfile>(
          () => {
            throw new Error("Can't parse user profile");
          },
          (data: UserProfile) => data
        )
      )
    );
}

export async function validateSessionAndGetProfile(
  base = Utils.CONSTS.DEFAULT_BASE
): Promise<{
  info: Communication.UserInfo;
  profile: UserProfile | null;
} | null> {
  const config = FileSystem.PrismicSharedConfigManager.get();

  if (!config.cookies.length) return Promise.resolve(null); // default config, logged out.
  if (base != config.base) return Promise.resolve(null); // not the same base so it doesn't

  try {
    const info = await Communication.validateSession(config.cookies, base);
    const profile = await getUserProfile(config.cookies, base).catch(
      () => null
    );
    return { info, profile };
  } catch {
    return null;
  }
}
