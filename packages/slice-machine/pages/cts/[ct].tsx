import { useRouter } from "next/router";

import { useCustomTypeReducer } from "src/models/customType/modelReducer";
import { CustomType, ObjectTabs } from "@lib/models/common/CustomType";
import CustomTypeBuilder from "@lib/builders/CustomTypeBuilder";
import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getEnvironment } from "@src/modules/environment";
import {
  selectLocalCustomTypes,
  selectRemoteCustomTypes,
} from "@src/modules/customTypes";

type CustomTypeBuilderWithProviderProps = {
  customType: CustomType<ObjectTabs>;
  remoteCustomType?: CustomType<ObjectTabs>;
};

const CustomTypeBuilderWithProvider: React.FunctionComponent<CustomTypeBuilderWithProviderProps> =
  ({ customType, remoteCustomType }) => {
    const { env } = useSelector((store: SliceMachineStoreType) => ({
      env: getEnvironment(store),
    }));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const initialMockConfig = CustomTypeMockConfig.getCustomTypeMockConfig(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      env.mockConfig,
      customType.id
    );
    const [Model, customTypeActions] = useCustomTypeReducer({
      customType,
      remoteCustomType,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      initialMockConfig,
    });
    return (
      <CustomTypeBuilder
        Model={Model}
        customTypeActions={customTypeActions}
      />
    );
  };

const CustomTypeBuilderWithRouter = () => {
  const router = useRouter();
  const { customTypes, remoteCustomTypes } = useSelector(
    (store: SliceMachineStoreType) => ({
      customTypes: selectLocalCustomTypes(store),
      remoteCustomTypes: selectRemoteCustomTypes(store),
    })
  );

  const customType = customTypes.find((e) => e && e.id === router.query.ct);
  const remoteCustomType = remoteCustomTypes.find(
    (e) => e && e.id === router.query.ct
  );

  if (!customType) {
    void router.replace("/");
    return null;
  }

  return (
    <CustomTypeBuilderWithProvider
      customType={customType}
      remoteCustomType={remoteCustomType}
    />
  );
};

export default CustomTypeBuilderWithRouter;
