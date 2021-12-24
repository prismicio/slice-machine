import path from "path";
import { Files } from "../internals";

enum Prefix {
  A = "@/",
  B = "~/",
  C = "/",
}

const Identifiers: Record<Prefix, number> = {
  "@/": 2,
  "~/": 2,
  "/": 1,
};

export const getFormattedLibIdentifier = (
  libPath: string
): {
  isLocal: boolean;
  identifier: string | undefined;
  from: string;
} => {
  const maybeIdentifier = Object.keys(Identifiers).find(
    (e) => libPath.indexOf(e) === 0
  );
  const isLocal = !!maybeIdentifier;
  return {
    isLocal,
    identifier: maybeIdentifier,
    from: isLocal
      ? libPath.slice(Identifiers[maybeIdentifier as Prefix])
      : libPath,
  };
};

export function getInfoFromPath(
  startPath: string,
  libPath: string
): {
  isLocal: boolean;
  from: string;
  pathExists: boolean;
  pathToLib: string;
  pathToSlices: string;
} {
  const { isLocal, from } = getFormattedLibIdentifier(libPath);
  const pathToLib = path.join(
    startPath || process.cwd(),
    isLocal ? "" : "node_modules",
    isLocal ? libPath.substring(1, libPath.length) : libPath
  );

  const pathExists = Files.exists(pathToLib);
  const pathToSlices = path.join(pathToLib, isLocal ? "." : "slices");

  return {
    isLocal,
    from,
    pathExists,
    pathToLib,
    pathToSlices,
  };
}
