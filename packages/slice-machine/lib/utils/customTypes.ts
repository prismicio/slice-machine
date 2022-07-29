import Files from "./files";
import { CustomTypesPaths } from "../models/paths";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType/index";
import glob from "glob";
import * as IO from "../io";

export function getLocalCustomTypes(cwd: string): CustomTypeSM[] {
  const pathToCustomTypes = CustomTypesPaths(cwd).value();

  const folderExists = Files.exists(pathToCustomTypes);
  if (!folderExists) return [];

  const matches = glob.sync(`${pathToCustomTypes}/**/index.json`);

  return matches.reduce((acc: Array<CustomTypeSM>, p: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const smModel = IO.CustomType.readCustomType(p);
      return [...acc, smModel];
    } catch (e) {
      return acc;
    }
  }, []);
}
