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

const RolesV = t.keyof({
  [Roles.WRITER]: null,
  [Roles.OWNER]: null,
  [Roles.PUBLISHER]: null,
  [Roles.ADMIN]: null,
  [Roles.SUPERUSER]: null,
  [Roles.MANAGER]: null,
  [Roles.READONLY]: null,
});

export const RolePerLocaleProfile = t.record(t.string, RolesV);
export type RolePerLocaleProfile = t.TypeOf<typeof RolePerLocaleProfile>;

export const RolesValidator = t.union([RolesV, RolePerLocaleProfile]);
export type RolesValidator = t.TypeOf<typeof RolesValidator>;

export function canUpdateCustomTypes(role: RolesValidator): boolean {
  if (role === Roles.OWNER) return true;
  if (role === Roles.ADMIN) return true;
  if (role === Roles.SUPERUSER) return true;
  return false;
}
