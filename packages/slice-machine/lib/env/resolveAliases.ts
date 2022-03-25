import path from "path";
import {
  JsonPackage,
  retrieveJsonPackage,
} from "@slicemachine/core/build/node-utils";
import moduleAlias from "module-alias";

type PackageWithModuleAliases = JsonPackage & {
  _moduleAliases: Record<string, string>;
};

const isAPackageHasModuleAliases = (
  jsonPackage: JsonPackage | PackageWithModuleAliases
): jsonPackage is PackageWithModuleAliases => {
  return jsonPackage.hasOwnProperty("_moduleAliases");
};

export function resolveAliases(cwd: string): void {
  const pkg = retrieveJsonPackage(cwd);
  if (!pkg.content || !isAPackageHasModuleAliases(pkg.content)) {
    return;
  }

  const moduleAliases: [string, string][] = Object.entries(
    pkg.content._moduleAliases
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
