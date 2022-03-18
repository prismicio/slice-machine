import { normalize, NormalizedSchema, schema } from "normalizr";
import { CustomType, ObjectTabs } from "@models/common/CustomType";
import { FrontEndCustomType } from "@src/modules/availableCustomTypes/types";

// Define a users schema
const customTypeSchema = new schema.Entity("customTypes");

const normalizeCustomType = (
  customTypesData: CustomType<ObjectTabs>
): NormalizedSchema<
  {
    customTypes: Record<string, CustomType<ObjectTabs>>;
  },
  string[]
> => normalize(customTypesData, customTypeSchema);

const normalizeCustomTypes = (
  customTypesData: ReadonlyArray<CustomType<ObjectTabs>>
): NormalizedSchema<
  {
    customTypes: Record<string, CustomType<ObjectTabs>>;
  },
  string[]
> => normalize(customTypesData, [customTypeSchema]);

export const normalizeFrontendCustomType = (
  localCustomType: CustomType<ObjectTabs>,
  remoteCustomType?: CustomType<ObjectTabs>
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
  localCustomTypes: ReadonlyArray<CustomType<ObjectTabs>>,
  remoteCustomTypes: ReadonlyArray<CustomType<ObjectTabs>>
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
