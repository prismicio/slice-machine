import { LocalOrRemoteCustomType } from "@lib/models/common/ModelData";
import { CustomTypeSM } from "@lib/models/common/CustomType";

export const normalizeFrontendCustomType = (
  localCustomType: CustomTypeSM,
  remoteCustomType?: CustomTypeSM
) => {
  return remoteCustomType
    ? {
        [localCustomType.id]: {
          local: localCustomType,
          remote: remoteCustomType,
        },
      }
    : {
        [localCustomType.id]: {
          local: localCustomType,
        },
      };
};

export const normalizeFrontendCustomTypes = (
  localCustomTypes: ReadonlyArray<CustomTypeSM>,
  remoteCustomTypes: ReadonlyArray<CustomTypeSM>
): Record<string, LocalOrRemoteCustomType> => {
  const customTypes: Record<string, LocalOrRemoteCustomType> = {};

  localCustomTypes.forEach((t) => (customTypes[t.id] = { local: t }));
  remoteCustomTypes.forEach(
    (t) => (customTypes[t.id] = { ...customTypes[t.id], remote: t })
  );

  return customTypes;
};
