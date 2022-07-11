import { ModalStoreType } from "@src/modules/modal/types";
import { LoadingStoreType } from "@src/modules/loading/types";
import { UserContextStoreType } from "@src/modules/userContext/types";
import { EnvironmentStoreType } from "@src/modules/environment/types";
import { SimulatorStoreType } from "@src/modules/simulator/types";
import { AvailableCustomTypesStoreType } from "@src/modules/availableCustomTypes/types";
import { SelectedCustomTypeStoreType } from "@src/modules/selectedCustomType/types";
import { SlicesStoreType } from "@src/modules/slices/types";
import { RouterState } from "connected-next-router/types";
import { ModelErrorsStoreType } from "@src/modules/modelErrors/types";

export type SliceMachineStoreType = {
  modal: ModalStoreType;
  loading: LoadingStoreType;
  userContext: UserContextStoreType;
  environment: EnvironmentStoreType;
  simulator: SimulatorStoreType;
  availableCustomTypes: AvailableCustomTypesStoreType;
  selectedCustomType: SelectedCustomTypeStoreType;
  slices: SlicesStoreType;
  modelErrors: ModelErrorsStoreType;
  router: RouterState;
};
