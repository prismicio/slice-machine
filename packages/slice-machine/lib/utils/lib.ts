import path from "path";
import Files from "./files";

const SM_CONFIG_FILE = "sm.config.json";

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

export const findIndexFile = (libPath: string): string | null => {
  try {
    const dir = Files.readDirectory(libPath);
    const maybeF = dir.find(
      (f) => Files.isFile(path.join(libPath, f)) && f.startsWith("index.")
    );
    return maybeF ? path.join(libPath, maybeF) : null;
  } catch (e) {
    return null;
  }
};

export const getFormattedLibIdentifier = (
  libPath: string
): { identifier: string | undefined; from: string; isLocal: boolean } => {
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
  libPath: string,
  startPath: string
): {
  config: Record<string, string>;
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
  const pathToConfig = path.join(pathToLib, SM_CONFIG_FILE);
  const pathExists = Files.exists(pathToLib);

  let config: Record<string, string> = {};
  if (Files.exists(pathToConfig)) {
    config = Files.readJson(pathToConfig);
  }
  const pathToSlices = path.join(
    pathToLib,
    config.pathToLibrary || ".",
    config.slicesFolder || (isLocal ? "." : "slices")
  );
  return {
    config,
    isLocal,
    from,
    pathExists,
    pathToLib,
    pathToSlices,
  };
}
