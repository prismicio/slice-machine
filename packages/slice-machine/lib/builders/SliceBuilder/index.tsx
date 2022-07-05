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
import {
  generateCustomScreenShot,
  generateScreenShot,
} from "@src/modules/selectedSlice/screenshot";
import pushSliceApiCall from "@src/modules/selectedSlice/push";
import saveSliceApiCall from "@src/modules/selectedSlice/save";
import { useRouter } from "next/router";
import { selectCurrentSlice } from "@src/modules/selectedSlice/selectors";
import SliceState from "@lib/models/ui/SliceState";

type SliceBuilderState = {
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
  initModel: SliceState;
  initVariationId: string;
}

const SliceBuilder: React.FC<SliceBuilderProps> = ({
  initModel,
  initVariationId,
}) => {
  useEffect(() => {
    initSliceStore(initModel);
  }, []);

  const { Model } = useSelector((state: SliceMachineStoreType) => ({
    Model: state.selectedSlice?.Model,
  }));

  const variation = Model?.variations.find(
    (variation) => variation.id === initVariationId
  );

  const {
    openLoginModal,
    checkSimulatorSetup,
    openToaster,
    initSliceStore,
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
    if (Model?.isTouched) {
      setData(initialState);
    }
  }, [Model?.isTouched]);

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
      Model && variation
        ? [{ sliceID: Model.model.id, variationID: variation.id }]
        : null,
    [Model?.model.id, variation?.id]
  );

  if (!Model || !variation || !sliceView) return null;

  const onTakingCustomScreenshot = () => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    checkSimulatorSetup(true, async () => {
      await generateScreenShot(
        variation.id,
        Model.from,
        Model.model.name,
        setData,
        (screenshots) => generateSliceScreenshot(screenshots)
      );
    });
  };

  return (
    <Box sx={{ flex: 1 }}>
      <Header
        Model={Model}
        variation={variation}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/no-misused-promises
        onPush={async () => {
          await pushSliceApiCall(Model, onPush, () => pushSlice());
        }}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/no-misused-promises
        onSave={async () => {
          await saveSliceApiCall(Model, setData, (state) => saveSlice(state));
        }}
        isLoading={data.loading}
        imageLoading={data.imageLoading}
      />
      <FlexEditor
        sx={{ py: 4 }}
        SideBar={
          <SideBar
            Model={Model}
            variation={variation}
            onScreenshot={onTakingCustomScreenshot}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onHandleFile={async (file: Blob) => {
              await generateCustomScreenShot(
                variation.id,
                Model.from,
                Model.model.name,
                setData,
                file,
                (variationId, screenshot) =>
                  generateSliceCustomScreenshot(variationId, screenshot)
              );
            }}
            imageLoading={data.imageLoading}
          />
        }
      >
        <FieldZones Model={Model} variation={variation} />
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

  const { Model } = useSelector((store: SliceMachineStoreType) => ({
    Model: selectCurrentSlice(
      store,
      router.query.lib as string,
      router.query.sliceName as string
    ),
  }));

  if (!Model) {
    void router.replace("/");
    return null;
  }

  return (
    <SliceBuilder
      initModel={Model}
      initVariationId={router.query.variation as string}
    />
  );
};

export default SliceBuilderWithRouter;
