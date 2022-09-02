import Files from "../utils/files";
import { CustomType } from "@prismicio/types-internal/lib/customtypes/CustomType";
import {
  CustomTypes,
  CustomTypeSM,
} from "@slicemachine/core/build/models/CustomType/index";

export function readCustomType(path: string): CustomTypeSM {
  const ct: CustomType = Files.readJson(path);
  return CustomTypes.toSM(ct);
}

export function writeCustomType(path: string, customType: CustomTypeSM) {
  Files.write(path, CustomTypes.fromSM(customType));
}

export function renameCustomType(modelPath: string, newCustomTypeName: string) {
  const customType = readCustomType(modelPath);
  customType.label = newCustomTypeName;
  writeCustomType(modelPath, customType);
}
