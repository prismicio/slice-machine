import path from "path";
import moduleAlias from "module-alias";
import { FileSystem } from "@slicemachine/core";

type PKG = FileSystem.JsonPackage & { _moduleAliases: string[] };

export function resolveAliases(cwd: string) {
  const pkg = FileSystem.retrieveJsonPackage(cwd).content as PKG;
  const LIB_PATH = path.join(cwd, "build", "lib");

  Object.entries(pkg._moduleAliases).forEach(([key]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore As the 2.1 typing is not available yet and solve this problem
    moduleAlias.addAlias(key, (fromPath: string) => {
      return path.join(path.relative(path.dirname(fromPath), LIB_PATH));
    });
  });
}
