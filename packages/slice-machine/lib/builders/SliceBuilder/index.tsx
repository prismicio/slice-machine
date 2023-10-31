import { Box, Button } from "@prismicio/editor-ui";
import {
  type Dispatch,
  type FC,
  type SetStateAction,
  useEffect,
  useState,
} from "react";

import {
  type ToastPayload,
  handleRemoteResponse,
} from "@src/modules/toaster/utils";

import FieldZones from "./FieldZones";
import { Sidebar } from "./Sidebar";

import useSliceMachineActions from "src/modules/useSliceMachineActions";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";

import SimulatorButton from "@builders/SliceBuilder/SimulatorButton";
import {
  AppLayout,
  AppLayoutActions,
  AppLayoutBackButton,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@components/AppLayout";
import { VariationSM } from "@lib/models/common/Slice";
import { ComponentUI } from "@lib/models/common/ComponentUI";

import { FloatingBackButton } from "@src/features/slices/sliceBuilder/FloatingBackButton";
import { selectIsSimulatorAvailableForFramework } from "@src/modules/environment";
import { isSelectedSliceTouched } from "@src/modules/selectedSlice/selectors";
import { ComponentWithSliceProps } from "@src/layouts/WithSlice";

export type SliceBuilderState = ToastPayload & { loading: boolean };

export const initialState: SliceBuilderState = {
  loading: false,
  done: false,
};

const SliceBuilder: ComponentWithSliceProps = ({ slice, variation }) => {
  const { openToaster } = useSliceMachineActions();
  const isTouched = useSelector((store: SliceMachineStoreType) =>
    isSelectedSliceTouched(store, slice.from, slice.model.id),
  );

  // We need to move this state to somewhere global to update the UI if any action from anywhere save or update to the filesystem I'd guess
  const [state, setState] = useState<SliceBuilderState>(initialState);

  useEffect(() => {
    if (isTouched) {
      setState(initialState);
    }
  }, [isTouched]);

  // activate/deactivate Success message
  useEffect(() => {
    if (state.done) {
      handleRemoteResponse(openToaster)(state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!variation) return <AppLayout />;
  else
    return (
      <SliceBuilderForVariation
        setState={setState}
        slice={slice}
        variation={variation}
        isTouched={isTouched}
        state={state}
      />
    );
};

type SliceBuilderForVariationProps = {
  setState: Dispatch<SetStateAction<SliceBuilderState>>;
  slice: ComponentUI;
  variation: VariationSM;
  isTouched: boolean;
  state: SliceBuilderState;
};
const SliceBuilderForVariation: FC<SliceBuilderForVariationProps> = ({
  setState,
  slice,
  variation,
  isTouched,
  state,
}) => {
  const isSimulatorAvailableForFramework = useSelector(
    selectIsSimulatorAvailableForFramework,
  );
  const { updateSlice } = useSliceMachineActions();

  return (
    <AppLayout>
      <AppLayoutHeader>
        <AppLayoutBackButton url="/slices" />
        <AppLayoutBreadcrumb folder="Slices" page={slice.model.name} />
        <AppLayoutActions>
          <SimulatorButton
            isSimulatorAvailableForFramework={isSimulatorAvailableForFramework}
            isTouched={!!isTouched}
          />
          <Button
            loading={state.loading}
            disabled={!isTouched || state.loading}
            onClick={() => {
              updateSlice(slice, setState);
            }}
            data-cy="builder-save-button"
          >
            Save
          </Button>
        </AppLayoutActions>
      </AppLayoutHeader>
      <AppLayoutContent>
        <Box
          alignItems="flex-start"
          display="grid"
          gap={16}
          gridTemplateColumns="320px 1fr"
        >
          <Sidebar
            slice={slice}
            variation={variation}
            sliceBuilderState={state}
            setSliceBuilderState={setState}
          />
          <FieldZones variation={variation} />
        </Box>
        <FloatingBackButton />
      </AppLayoutContent>
    </AppLayout>
  );
};

export default SliceBuilder;
