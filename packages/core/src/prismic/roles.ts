import * as t from "io-ts";

export enum Roles {
  WRITER = "Writer",
  OWNER = "Owner",
  PUBLISHER = "Publisher",
  ADMIN = "Administrator",
  SUPERUSER = "SuperUser",
  MANAGER = "Manager",
  READONLY = "Readonly",
}

const RolesV = t.union([
  t.literal(Roles.WRITER),
  t.literal(Roles.OWNER),
  t.literal(Roles.PUBLISHER),
  t.literal(Roles.ADMIN),
  t.literal(Roles.SUPERUSER),
  t.literal(Roles.MANAGER),
  t.literal(Roles.READONLY),
]);

export const RolePerLocaleProfile = t.record(t.string, RolesV);

export const RolesValidator = t.union([RolesV, RolePerLocaleProfile]);

export function canUpdateCustomTypes(
  role: Roles | Record<string, Roles>
): boolean {
  if (role === Roles.OWNER) return true;
  if (role === Roles.ADMIN) return true;
  if (role === Roles.SUPERUSER) return true;
  return false;
}
