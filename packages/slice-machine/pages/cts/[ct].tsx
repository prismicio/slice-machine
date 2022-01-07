import { useRouter } from "next/router";
import { useContext } from "react";

import { CustomTypesContext } from "src/models/customTypes/context";

import { useModelReducer } from "src/models/customType/modelReducer";
import { CustomType, ObjectTabs } from "@lib/models/common/CustomType";
import CustomTypeBuilder from "@lib/builders/CustomTypeBuilder";
import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getEnvironment } from "@src/modules/environment";

type CustomTypeBuilderWithProviderProps = {
  customType: CustomType<ObjectTabs>;
  remoteCustomType?: CustomType<ObjectTabs>;
  onLeave: Function;
};

const CustomTypeBuilderWithProvider: React.FunctionComponent<CustomTypeBuilderWithProviderProps> =
  ({ customType, remoteCustomType, onLeave }) => {
    const { env } = useSelector((store: SliceMachineStoreType) => ({
      env: getEnvironment(store),
    }));
    const initialMockConfig = CustomTypeMockConfig.getCustomTypeMockConfig(
      env.mockConfig,
      customType.id
    );
    const [Model, store] = useModelReducer({
      customType,
      remoteCustomType,
      initialMockConfig,
    });
    return <CustomTypeBuilder Model={Model} store={store} onLeave={onLeave} />;
  };

const CustomTypeBuilderWithRouter = () => {
  const router = useRouter();
  const { customTypes, remoteCustomTypes, onSave } =
    useContext(CustomTypesContext);

  const customType = customTypes?.find((e) => e && e.id === router.query.ct);
  const remoteCustomType = remoteCustomTypes?.find(
    (e) => e && e.id === router.query.ct
  );
  if (!customType) {
    router.replace("/");
    return null;
  }

  return (
    <CustomTypeBuilderWithProvider
      customType={customType}
      remoteCustomType={remoteCustomType}
      onLeave={onSave || function () {}}
    />
  );
};

export default CustomTypeBuilderWithRouter;
