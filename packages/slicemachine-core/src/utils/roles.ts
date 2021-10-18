import * as t from "io-ts";

export enum Roles {
  WRITER = "Writer",
  OWNER = "Owner",
  PUBLISHER = "Publisher",
  ADMIN = "Admin",
}

export const RolesValidator = t.union([
  t.literal(Roles.WRITER),
  t.literal(Roles.OWNER),
  t.literal(Roles.PUBLISHER),
  t.literal(Roles.ADMIN),
]);

export function canUpdateCustomTypes(role: Roles): boolean {
  if (role === Roles.OWNER) return true;
  if (role === Roles.ADMIN) return true;
  return false;
}
