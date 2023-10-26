import { Box, Button } from "@prismicio/editor-ui";
import React, { useState, useEffect } from "react";

import { handleRemoteResponse } from "@src/modules/toaster/utils";

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

export type SliceBuilderState = {
  loading: boolean;
  done: boolean;
};

export const initialState: SliceBuilderState = {
  loading: false,
  done: false,
};

const SliceBuilder: ComponentWithSliceProps = ({ slice, variation }) => {
  const { openToaster, updateSlice } = useSliceMachineActions();
  const isTouched = useSelector((store: SliceMachineStoreType) =>
    isSelectedSliceTouched(store, slice.from, slice.model.id),
  );

  // We need to move this state to somewhere global to update the UI if any action from anywhere save or update to the filesystem I'd guess
  const [data, setData] = useState<SliceBuilderState>(initialState);

  useEffect(() => {
    if (isTouched) {
      setData(initialState);
    }
  }, [isTouched]);

  // activate/deactivate Success message
  useEffect(() => {
    if (data.done) {
      // @ts-expect-error TS(2345) FIXME: Argument of type '(content: string | React.ReactNo... Remove this comment to see the full error message
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      handleRemoteResponse(openToaster)(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!variation) return <AppLayout />;
  else
    return (
      <SliceBuilderForVariation
        updateSlice={updateSlice.bind(null, slice, setData)}
        slice={slice}
        variation={variation}
        isTouched={isTouched}
        data={data}
      />
    );
};

type SliceBuilderForVariationProps = {
  updateSlice: () => void;
  slice: ComponentUI;
  variation: VariationSM;
  isTouched: boolean;
  data: SliceBuilderState;
};
const SliceBuilderForVariation: React.FC<SliceBuilderForVariationProps> = ({
  updateSlice,
  slice,
  variation,
  isTouched,
  data,
}) => {
  const isSimulatorAvailableForFramework = useSelector(
    selectIsSimulatorAvailableForFramework,
  );

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
            loading={data.loading}
            disabled={!isTouched || data.loading}
            onClick={updateSlice}
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
          <Sidebar slice={slice} variation={variation} />
          <FieldZones variation={variation} />
        </Box>
        <FloatingBackButton />
      </AppLayoutContent>
    </AppLayout>
  );
};

export default SliceBuilder;
