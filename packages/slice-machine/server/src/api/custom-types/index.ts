import { BackendEnvironment } from "../../../../lib/models/common/Environment";
import {
  CustomTypes,
  CustomTypeSM,
} from "@slicemachine/core/build/models/CustomType/index";
import { CustomType } from "@prismicio/types-internal/lib/customtypes/CustomType";
import { ClientError } from "@slicemachine/client";
import { getLocalCustomTypes } from "../../../../lib/utils/customTypes";
import { getCustomTypeStatus } from "../../../../src/utils/customType";
import { CustomTypeStatus } from "../../../../src/modules/selectedCustomType/types";

const fetchRemoteCustomTypes = async (
  env: BackendEnvironment
): Promise<{ remoteCustomTypes: CustomTypeSM[] | null }> => {
  return env.client
    .getCustomTypes()
    .then((customTypes: CustomType[]) => ({
      remoteCustomTypes: customTypes.map((c: CustomType) =>
        CustomTypes.toSM(c)
      ),
    }))
    .catch((error: ClientError) => {
      console.warn(error.message);
      return { remoteCustomTypes: null };
    });
};

export default async function handler(env: BackendEnvironment): Promise<{
  customTypes: ReadonlyArray<CustomTypeSM>;
  remoteCustomTypes: ReadonlyArray<CustomTypeSM>;
}> {
  const { cwd } = env;

  const { remoteCustomTypes } = await fetchRemoteCustomTypes(env);
  const localCustomTypes = getLocalCustomTypes(cwd);

  const localCustomTypesWithStatus = localCustomTypes.map(
    (customType: CustomTypeSM) => {
      if (remoteCustomTypes) {
        const remoteCustomType = remoteCustomTypes.find(
          (rct) => rct.id == customType.id
        );

        return {
          ...customType,
          __status: getCustomTypeStatus(customType, remoteCustomType),
        };
      } else {
        return {
          ...customType,
          __status: CustomTypeStatus.UnknownDisconnected,
        };
      }
    }
  );
  return {
    customTypes: localCustomTypesWithStatus,
    remoteCustomTypes: remoteCustomTypes || [],
  };
}
