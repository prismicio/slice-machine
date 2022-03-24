import path from "path";
import moduleAlias from "module-alias";
import * as NodeUtils from "@slicemachine/core/build/node-utils";

type PackageWithModuleAliases = NodeUtils.JsonPackage & {
  _moduleAliases: Record<string, string>;
};

const isAPackageHasModuleAliases = (
  jsonPackage: NodeUtils.JsonPackage | PackageWithModuleAliases
): jsonPackage is PackageWithModuleAliases => {
  return jsonPackage.hasOwnProperty("_moduleAliases");
};

export function resolveAliases(cwd: string): void {
  const pkg = NodeUtils.retrieveJsonPackage(cwd);
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
