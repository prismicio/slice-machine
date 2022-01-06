import type { PackageJson } from "types-package-json";

import { JsonPackagePath, FileContent } from "./paths";
import { Files } from "../internals";

export function retrieveJsonPackage(cwd: string): FileContent<PackageJson> {
  const pkgPath = JsonPackagePath(cwd);

  if (!Files.exists(pkgPath)) {
    return {
      exists: false,
      content: null,
    };
  }

  const content: PackageJson | null = Files.safeReadJson(
    pkgPath
  ) as PackageJson | null;
  return {
    exists: true,
    content,
  };
}

export function patchJsonPackage(
  cwd: string,
  data: Partial<PackageJson>
): boolean {
  const pkg: FileContent<PackageJson> = retrieveJsonPackage(cwd);
  if (!pkg.exists || !pkg.content) return false;

  const updatedPkg = {
    ...pkg.content,
    ...data,
  };

  Files.write(JsonPackagePath(cwd), updatedPkg, { recursive: false });
  return true;
}
