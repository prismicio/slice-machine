import React, { useState, useEffect, useMemo } from "react";

import { handleRemoteResponse } from "@src/modules/toaster/utils";

import { Box } from "theme-ui";

import FieldZones from "./FieldZones";
import FlexEditor from "./FlexEditor";
import SideBar from "./SideBar";
import Header from "./Header";

import useSliceMachineActions from "src/modules/useSliceMachineActions";
import SetupDrawer from "./SetupDrawer";
import IframeRenderer from "@components/Simulator/components/IframeRenderer";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { selectSimulatorUrl } from "@src/modules/environment";
import { Size } from "@components/Simulator/components/ScreenSizes";
import { selectIsWaitingForIFrameCheck } from "@src/modules/simulator";
import { useRouter } from "next/router";
import {
  isSelectedSliceTouched,
  selectCurrentSlice,
} from "@src/modules/selectedSlice/selectors";
import { VariationSM } from "@slicemachine/core/build/models";
import { ComponentUI } from "@lib/models/common/ComponentUI";

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

interface SliceBuilderProps {
  component: ComponentUI;
  variation: VariationSM | undefined;
}

const SliceBuilder: React.FC<SliceBuilderProps> = ({
  component,
  variation,
}) => {
  const {
    openLoginModal,
    openToaster,
    generateSliceScreenshot,
    generateSliceCustomScreenshot,
    pushSlice,
    saveSlice,
    checkSimulatorSetup,
  } = useSliceMachineActions();
  const { simulatorUrl, isWaitingForIframeCheck, isTouched } = useSelector(
    (state: SliceMachineStoreType) => ({
      simulatorUrl: selectSimulatorUrl(state),
      isWaitingForIframeCheck: selectIsWaitingForIFrameCheck(state),
      isTouched: isSelectedSliceTouched(
        state,
        component.from,
        component.model.id
      ),
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      handleRemoteResponse(openToaster)(data);
    }
  }, [data]);

  const sliceView = useMemo(
    () =>
      component && variation
        ? [
            {
              sliceID: component.model.id,
              variationID: variation.id,
            },
          ]
        : null,
    [component.model.id, variation?.id]
  );

  if (!variation || !sliceView) return null;

  const onTakingSliceScreenshot = () => {
    checkSimulatorSetup(true, () =>
      generateSliceScreenshot(variation.id, component, setData)
    );
  };

  const onTakingSliceCustomScreenshot = (file: Blob) => {
    generateSliceCustomScreenshot(variation.id, component, setData, file);
  };

  const onPushSlice = () => {
    pushSlice(component, (data: SliceBuilderState) => {
      setData(data);
      if (data.error && data.status === 403) {
        openLoginModal();
      }
    });
  };

  const onSaveSlice = () => {
    saveSlice(component, setData);
  };

  return (
    <Box sx={{ flex: 1 }}>
      <Header
        component={component}
        isTouched={isTouched}
        variation={variation}
        onPush={onPushSlice}
        onSave={onSaveSlice}
        isLoading={data.loading}
        imageLoading={data.imageLoading}
      />
      <FlexEditor
        sx={{ py: 4 }}
        SideBar={
          <SideBar
            component={component}
            variation={variation}
            onScreenshot={onTakingSliceScreenshot}
            onHandleFile={onTakingSliceCustomScreenshot}
            imageLoading={data.imageLoading}
          />
        }
      >
        <FieldZones mockConfig={component.mockConfig} variation={variation} />
      </FlexEditor>
      <SetupDrawer />
      {isWaitingForIframeCheck && (
        <IframeRenderer
          dryRun
          size={Size.FULL}
          simulatorUrl={simulatorUrl}
          sliceView={sliceView}
        />
      )}
    </Box>
  );
};

const SliceBuilderWithRouter = () => {
  const router = useRouter();
  const { initSliceStore } = useSliceMachineActions();

  const { component } = useSelector((store: SliceMachineStoreType) => ({
    component: selectCurrentSlice(
      store,
      router.query.lib as string,
      router.query.sliceName as string
    ),
  }));

  if (!component) {
    void router.replace("/");
    return null;
  }

  useEffect(() => {
    initSliceStore(component);
  }, []);

  const variation = component.model.variations.find(
    (variation) => variation.id === router.query.variation
  );

  return <SliceBuilder component={component} variation={variation} />;
};

export default SliceBuilderWithRouter;
