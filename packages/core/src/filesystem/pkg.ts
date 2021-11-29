import { JsonPackagePath, FileContent } from "./paths";
import { CONSTS, Files } from "../utils";
import type { PackageJson } from "types-package-json";

export type JsonPackage = PackageJson;

export function retrieveJsonPackage(cwd: string): FileContent<JsonPackage> {
  const pkgPath = JsonPackagePath(cwd);

  if (!Files.exists(pkgPath)) {
    return {
      exists: false,
      content: null,
    };
  }

  const content: JsonPackage | null = Files.safeReadJson(
    pkgPath
  ) as JsonPackage | null;
  return {
    exists: true,
    content,
  };
}

export function patchJsonPackage(
  cwd: string,
  data: Partial<JsonPackage>
): boolean {
  const pkg: FileContent<JsonPackage> = retrieveJsonPackage(cwd);
  if (!pkg.exists || !pkg.content) return false;

  const updatedPkg = {
    ...pkg.content,
    ...data,
  };

  Files.write(JsonPackagePath(cwd), updatedPkg, { recursive: false });
  return true;
}

export function addJsonPackageSmScript(cwd: string): boolean {
  const pkg = retrieveJsonPackage(cwd);
  if (!pkg.exists || !pkg.content) return false;

  const { scripts = {} } = pkg.content;

  if (scripts[CONSTS.SCRIPT_NAME]) return false;

  return patchJsonPackage(cwd, {
    scripts: { ...scripts, [CONSTS.SCRIPT_NAME]: CONSTS.SCRIPT_VALUE },
  });
}
