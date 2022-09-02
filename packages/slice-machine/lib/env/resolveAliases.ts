import path from "path";
import {
  JsonPackage,
  retrieveJsonPackage,
} from "@slicemachine/core/build/node-utils";
import moduleAlias from "module-alias";

/* eslint-disable */
// Disabling eslint for this file, it keeps throwing errors.
type PackageWithModuleAliases = JsonPackage & {
  _moduleAliases?: Record<string, string>;
};

const isAPackageHasModuleAliases = (
  jsonPackage: JsonPackage
): jsonPackage is PackageWithModuleAliases => {
  return (
    typeof jsonPackage === typeof {} &&
    jsonPackage.hasOwnProperty("_moduleAliases")
  );
};

export function resolveAliases(cwd: string): void {
  const pkg = retrieveJsonPackage(cwd);
  const pkgContent: JsonPackage | null = pkg.content;
  if (!pkgContent || !isAPackageHasModuleAliases(pkgContent)) {
    return;
  }

  const moduleAliases: [string, string][] = Object.entries(
    pkgContent._moduleAliases || {}
  );

  moduleAliases.forEach(([key, value]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore As the 2.1 typing is not available yet and solve this problem
    moduleAlias.addAlias(key, (fromPath: string) => {
      return path.join(
        path.relative(path.dirname(fromPath), path.join(cwd, value))
      );
    });
  });
}
