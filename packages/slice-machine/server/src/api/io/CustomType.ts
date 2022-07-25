import Files from "@lib/utils/files";
import { CustomType } from "@prismicio/types-internal/lib/customtypes/CustomType";
import {
  CustomTypes,
  CustomTypeSM,
} from "@slicemachine/core/build/models/CustomType/index";
import { generateTypes } from "prismic-ts-codegen";

export function readCustomType(path: string): CustomTypeSM {
  const ct: CustomType = Files.readJson(path);
  return CustomTypes.toSM(ct);
}

export function writeCustomType(path: string, customType: CustomTypeSM) {
  Files.write(path, CustomTypes.fromSM(customType));
}

export function writeCustomTypeTypes(path: string, customType: CustomTypeSM) {
  const content = generateTypes({
    customTypeModels: [CustomTypes.fromSM(customType)],
  });

  Files.write(path, content);
}

export function renameCustomType(
  modelPath: string,
  typesPath: string,
  newCustomTypeName: string
) {
  const customType = readCustomType(modelPath);
  customType.label = newCustomTypeName;
  writeCustomType(modelPath, customType);
  writeCustomTypeTypes(typesPath, customType);
}
