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
import { selectCurrentSlice } from "@src/modules/selectedSlice/selectors";
import { VariationSM } from "@slicemachine/core/build/models";
import { ExtendedComponentUI } from "@src/modules/selectedSlice/types";

export type SliceBuilderState = {
  imageLoading: boolean;
  loading: boolean;
  done: boolean;
  error: null;
  status: number | null;
};

const initialState: SliceBuilderState = {
  imageLoading: false,
  loading: false,
  done: false,
  error: null,
  status: null,
};

interface SliceBuilderProps {
  extendedComponent: ExtendedComponentUI;
  variation: VariationSM | undefined;
}

const SliceBuilder: React.FC<SliceBuilderProps> = ({
  extendedComponent,
  variation,
}) => {
  const {
    openLoginModal,
    openToaster,
    generateSliceScreenshot,
    generateSliceCustomScreenshot,
    pushSlice,
    saveSlice,
  } = useSliceMachineActions();
  const { simulatorUrl, isWaitingForIframeCheck } = useSelector(
    (state: SliceMachineStoreType) => ({
      simulatorUrl: selectSimulatorUrl(state),
      isWaitingForIframeCheck: selectIsWaitingForIFrameCheck(state),
    })
  );

  // We need to move this state to somewhere global to update the UI if any action from anywhere save or update to the filesystem I'd guess
  const [data, setData] = useState<SliceBuilderState>(initialState);

  const onPush = (data: SliceBuilderState) => {
    setData(data);
    if (data.error && data.status === 403) {
      openLoginModal();
    }
  };

  useEffect(() => {
    if (extendedComponent?.isTouched) {
      setData(initialState);
    }
  }, [extendedComponent?.isTouched]);

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
      extendedComponent && variation
        ? [
            {
              sliceID: extendedComponent.component.model.id,
              variationID: variation.id,
            },
          ]
        : null,
    [extendedComponent.component.model.id, variation?.id]
  );

  if (!variation || !sliceView) return null;

  const onTakingSliceScreenshot = () => {
    generateSliceScreenshot(variation.id, extendedComponent.component, setData);
  };

  const onTakingSliceCustomScreenshot = (file: Blob) => {
    generateSliceCustomScreenshot(
      variation.id,
      extendedComponent.component,
      setData,
      file
    );
  };

  const onPushSlice = () => {
    pushSlice(extendedComponent, onPush);
  };

  const onSaveSlice = () => {
    saveSlice(extendedComponent, setData);
  };

  return (
    <Box sx={{ flex: 1 }}>
      <Header
        component={extendedComponent.component}
        isTouched={extendedComponent.isTouched}
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
            component={extendedComponent.component}
            variation={variation}
            onScreenshot={onTakingSliceScreenshot}
            onHandleFile={onTakingSliceCustomScreenshot}
            imageLoading={data.imageLoading}
          />
        }
      >
        <FieldZones
          mockConfig={extendedComponent.mockConfig}
          variation={variation}
        />
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

  const { extendedModel } = useSelector((store: SliceMachineStoreType) => ({
    extendedModel: selectCurrentSlice(
      store,
      router.query.lib as string,
      router.query.sliceName as string
    ),
  }));

  if (!extendedModel) {
    void router.replace("/");
    return null;
  }

  useEffect(() => {
    initSliceStore(extendedModel);
  }, []);

  const variation = extendedModel.component.model.variations.find(
    (variation) => variation.id === router.query.variation
  );

  return (
    <SliceBuilder extendedComponent={extendedModel} variation={variation} />
  );
};

export default SliceBuilderWithRouter;
