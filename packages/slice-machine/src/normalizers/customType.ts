import { normalize, NormalizedSchema, schema } from "normalizr";
import { FrontEndCustomType } from "@src/modules/availableCustomTypes/types";
import { CustomTypeSM } from "@slicemachine/core/build/src/models/CustomType";

// Define a users schema
const customTypeSchema = new schema.Entity("customTypes");

const normalizeCustomType = (
  customTypesData: CustomTypeSM
): NormalizedSchema<
  {
    customTypes: Record<string, CustomTypeSM>;
  },
  string[]
> => normalize(customTypesData, customTypeSchema);

const normalizeCustomTypes = (
  customTypesData: ReadonlyArray<CustomTypeSM>
): NormalizedSchema<
  {
    customTypes: Record<string, CustomTypeSM>;
  },
  string[]
> => normalize(customTypesData, [customTypeSchema]);

export const normalizeFrontendCustomType = (
  localCustomType: CustomTypeSM,
  remoteCustomType?: CustomTypeSM
) => {
  const { entities: localEntities } = normalizeCustomType(localCustomType);

  if (!remoteCustomType) {
    return Object.values(localEntities.customTypes).reduce<
      Record<string, FrontEndCustomType>
    >((acc, localCustomType) => {
      acc[localCustomType.id] = {
        local: localCustomType,
      };

      return acc;
    }, {});
  }

  const { entities: remoteEntities } = normalizeCustomType(remoteCustomType);

  return Object.values(localEntities.customTypes).reduce<
    Record<string, FrontEndCustomType>
  >((acc, localCustomType) => {
    acc[localCustomType.id] = {
      local: localCustomType,
      ...(remoteEntities.hasOwnProperty("customTypes") &&
      remoteEntities.customTypes[localCustomType.id]
        ? { remote: remoteEntities.customTypes[localCustomType.id] }
        : {}),
    };

    return acc;
  }, {});
};

export const normalizeFrontendCustomTypes = (
  localCustomTypes: ReadonlyArray<CustomTypeSM>,
  remoteCustomTypes: ReadonlyArray<CustomTypeSM>
): Record<string, FrontEndCustomType> => {
  const { entities: localEntities } = normalizeCustomTypes(localCustomTypes);
  const { entities: remoteEntities } = normalizeCustomTypes(remoteCustomTypes);

  return Object.values(localEntities.customTypes).reduce<
    Record<string, FrontEndCustomType>
  >((acc, localCustomType) => {
    acc[localCustomType.id] = {
      local: localCustomType,
      ...(remoteEntities.hasOwnProperty("customTypes") &&
      remoteEntities.customTypes[localCustomType.id]
        ? { remote: remoteEntities.customTypes[localCustomType.id] }
        : {}),
    };

    return acc;
  }, {});
};
