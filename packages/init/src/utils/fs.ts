import fs from "fs";
import path from "path";

export async function lsdir(dir: string): Promise<Array<string>> {
  return fs.promises.readdir(dir).then((dirs) => {
    return dirs
      .filter((name) => fs.statSync(path.join(dir, name)).isDirectory())
      .map((subdirectory) => path.join(dir, subdirectory));
  });
}

export async function lsfiles(dir: string): Promise<Array<string>> {
  return fs.promises.readdir(dir).then((dirs) => {
    return dirs
      .filter((name) => fs.statSync(path.join(dir, name)).isFile())
      .map((file) => path.join(dir, file));
  });
}
