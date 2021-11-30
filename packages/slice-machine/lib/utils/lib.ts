import path from "path";
import Files from "./files";

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
