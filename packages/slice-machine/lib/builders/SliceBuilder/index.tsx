import { Button } from "@prismicio/editor-ui";
import React, { useState, useEffect } from "react";

import { handleRemoteResponse } from "@src/modules/toaster/utils";

import { BaseStyles, Box, Grid } from "theme-ui";

import FieldZones from "./FieldZones";
import SideBar from "./SideBar";
import Header from "./Header";

import useSliceMachineActions from "src/modules/useSliceMachineActions";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";

import {
  AppLayout,
  AppLayoutActions,
  AppLayoutBackButton,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@components/AppLayout";
import SimulatorButton from "@lib/builders/SliceBuilder/Header/SimulatorButton";
import { SliceSM, VariationSM } from "@lib/models/common/Slice";
import { ComponentUI } from "@lib/models/common/ComponentUI";

import { FloatingBackButton } from "@src/features/slices/sliceBuilder/FloatingBackButton";
import { selectIsSimulatorAvailableForFramework } from "@src/modules/environment";
import { isSelectedSliceTouched } from "@src/modules/selectedSlice/selectors";
import { getRemoteSlice } from "@src/modules/slices";
import { useModelStatus } from "@src/hooks/useModelStatus";
import { ComponentWithSliceProps } from "@src/layouts/WithSlice";
import {
  LocalAndRemoteSlice,
  LocalOnlySlice,
} from "@lib/models/common/ModelData";

export type SliceBuilderState = {
  imageLoading: boolean;
  loading: boolean;
  done: boolean;
  error: null | string;
  status: number | null;
};

export const initialState: SliceBuilderState = {
  imageLoading: false,
  loading: false,
  done: false,
  error: null,
  status: null,
};

const SliceBuilder: ComponentWithSliceProps = ({ slice, variation }) => {
  const { openToaster, updateSlice } = useSliceMachineActions();
  const { isTouched, remoteSlice } = useSelector(
    (store: SliceMachineStoreType) => ({
      isTouched: isSelectedSliceTouched(store, slice.from, slice.model.id),
      remoteSlice: getRemoteSlice(store, slice.model.id),
    })
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
        remoteSlice={remoteSlice}
        isTouched={isTouched}
        data={data}
      />
    );
};

type SliceBuilderForVariationProps = {
  updateSlice: () => void;
  slice: ComponentUI;
  variation: VariationSM;
  remoteSlice: SliceSM | undefined;
  isTouched: boolean;
  data: SliceBuilderState;
};
const SliceBuilderForVariation: React.FC<SliceBuilderForVariationProps> = ({
  updateSlice,
  slice,
  variation,
  remoteSlice,
  isTouched,
  data,
}) => {
  const { isSimulatorAvailableForFramework } = useSelector(
    (state: SliceMachineStoreType) => ({
      isSimulatorAvailableForFramework:
        selectIsSimulatorAvailableForFramework(state),
    })
  );

  const sliceModel: LocalAndRemoteSlice | LocalOnlySlice = {
    local: slice.model,
    localScreenshots: slice.screenshots,
    ...(remoteSlice ? { remote: remoteSlice } : {}),
  };
  const { modelsStatuses } = useModelStatus({ slices: [sliceModel] });

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
        <BaseStyles>
          <Header
            component={slice}
            status={modelsStatuses.slices[slice.model.id]}
            variation={variation}
            imageLoading={data.imageLoading}
          />
          <Grid columns="1fr 320px" gap="16px" sx={{ pt: 4 }}>
            <Box>
              <FieldZones variation={variation} />
            </Box>
            <SideBar
              component={slice}
              variation={variation}
              isTouched={isTouched}
            />
          </Grid>
        </BaseStyles>
        <FloatingBackButton />
      </AppLayoutContent>
    </AppLayout>
  );
};

export default SliceBuilder;
