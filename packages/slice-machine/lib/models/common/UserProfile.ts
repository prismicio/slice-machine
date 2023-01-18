import * as t from "io-ts";

export const UserProfile = t.exact(
  t.type({
    userId: t.string,
    shortId: t.string,
    intercomHash: t.string,
    email: t.string,
    firstName: t.string,
    lastName: t.string,
  })
);

export type UserProfile = t.TypeOf<typeof UserProfile>;

export default UserProfile;
