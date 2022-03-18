import { useRouter } from "next/router";

import { useModelReducer } from "src/models/customType/modelReducer";
import CustomTypeBuilder from "@lib/builders/CustomTypeBuilder";
import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getEnvironment } from "@src/modules/environment";
import {
  selectLocalCustomTypes,
  selectRemoteCustomTypes,
} from "@src/modules/customTypes";
import { CustomTypeSM } from "@slicemachine/core/build/src/models/CustomType";

type CustomTypeBuilderWithProviderProps = {
  customType: CustomTypeSM;
  remoteCustomType?: CustomTypeSM;
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
    const [Model, store] = useModelReducer({
      customType,
      remoteCustomType,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      initialMockConfig,
    });
    return <CustomTypeBuilder Model={Model} store={store} />;
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
