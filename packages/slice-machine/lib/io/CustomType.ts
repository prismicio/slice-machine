import Files from "../utils/files";
import { CustomType } from "@prismicio/types-internal/lib/customtypes/CustomType";
import {
  CustomTypes,
  CustomTypeSM,
} from "@slicemachine/core/build/models/CustomType/index";
import path from "path";

export function readCustomType(src: string): CustomTypeSM {
  const ct: CustomType = Files.readJson(src);
  return CustomTypes.toSM(ct);
}

export function writeCustomType(src: string, customType: CustomTypeSM) {
  Files.write(src, CustomTypes.fromSM(customType));
}

export function renameCustomType(src: string, newCustomTypeName: string) {
  const customType = readCustomType(src);
  customType.label = newCustomTypeName;
  writeCustomType(src, customType);
}

export function deleteCustomType(src: string) {
  Files.hasWritePermissions(src);
  const files = Files.readDirectory(src);
  files.forEach((file) => Files.hasWritePermissions(path.join(src, file)));
  Files.removeDirectory(src);
}
