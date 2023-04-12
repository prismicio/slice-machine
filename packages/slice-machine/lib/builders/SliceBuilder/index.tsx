import React, { useState, useEffect } from "react";

import { handleRemoteResponse } from "@src/modules/toaster/utils";

import { Box } from "theme-ui";

import FieldZones from "./FieldZones";
import FlexEditor from "./FlexEditor";
import SideBar from "./SideBar";
import Header from "./Header";

import useSliceMachineActions from "src/modules/useSliceMachineActions";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";

import { SliceSM, VariationSM } from "@lib/models/common/Slice";
import { ComponentUI } from "@lib/models/common/ComponentUI";

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
  }, [data]);

  if (!variation) return null;
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
  const sliceModel: LocalAndRemoteSlice | LocalOnlySlice = {
    local: slice.model,
    localScreenshots: slice.screenshots,
    ...(remoteSlice ? { remote: remoteSlice } : {}),
  };

  const { modelsStatuses } = useModelStatus({ slices: [sliceModel] });

  return (
    <Box sx={{ flex: 1 }}>
      <Header
        component={slice}
        status={modelsStatuses.slices[slice.model.id]}
        isTouched={isTouched}
        variation={variation}
        onSave={updateSlice}
        isLoading={data.loading}
        imageLoading={data.imageLoading}
      />
      <FlexEditor
        sx={{ py: 4 }}
        SideBar={
          <SideBar
            component={slice}
            variation={variation}
            isTouched={isTouched}
          />
        }
      >
        <FieldZones variation={variation} />
      </FlexEditor>
    </Box>
  );
};

export default SliceBuilder;
