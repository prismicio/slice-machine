import path from "path";
import { Files } from "../internals";

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
