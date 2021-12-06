import * as t from "io-ts";

export const UserProfile = t.exact(
  t.type({
    userId: t.string,
  })
);

export type UserProfile = t.TypeOf<typeof UserProfile>;

export default UserProfile;
