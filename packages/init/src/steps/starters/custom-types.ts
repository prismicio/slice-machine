import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import path from "path";
import { Files } from "@slicemachine/core/build/node-utils";
import { isLeft } from "fp-ts/lib/Either";

export function readCustomTypes(cwd: string): Array<CustomType> {
  const dir = path.join(cwd, "customtypes");

  if (Files.isDirectory(dir) === false) return [];

  const fileNames = Files.readDirectory(dir);

  const files = fileNames.reduce<Array<CustomType>>((acc, fileName) => {
    const filePath = path.join(dir, fileName);
    const json = Files.safeReadJson(filePath);

    if (!json) return acc;

    const file = CustomType.decode(json);

    if (file instanceof Error) return acc;
    if (isLeft(file)) return acc;

    return [...acc, file.right];
  }, []);

  return files;
}
