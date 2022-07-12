import React, { useState, useContext, useEffect, useMemo } from "react";

import { handleRemoteResponse } from "@src/modules/toaster/utils";
import { SliceContext } from "src/models/slice/context";

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
import { findModelErrors } from "@src/modules/modelErrors";
import { findModelErrorsForVariation } from "@src/modules/modelErrors/types";

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

const SliceBuilder: React.FunctionComponent = () => {
  const { Model, store, variation } = useContext(SliceContext);

  const {
    openLoginModal,
    checkSimulatorSetup,
    openToaster,
    checkVariationModelErrors,
  } = useSliceMachineActions();
  const { simulatorUrl, isWaitingForIframeCheck, modelErrors } = useSelector(
    (state: SliceMachineStoreType) => ({
      simulatorUrl: selectSimulatorUrl(state),
      isWaitingForIframeCheck: selectIsWaitingForIFrameCheck(state),
      modelErrors: findModelErrors(state),
    })
  );

  if (!store || !Model || !variation) return null;

  useEffect(
    () => checkVariationModelErrors(Model.model.id, variation),
    [Model, variation]
  );

  const currentVariationModelErrors = findModelErrorsForVariation(
    modelErrors,
    Model.model.id,
    variation.id
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
    if (Model.isTouched) {
      setData(initialState);
    }
  }, [Model.isTouched]);

  // activate/deactivate Success message
  useEffect(() => {
    if (data.done) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      handleRemoteResponse(openToaster)(data);
    }
  }, [data]);

  useEffect(() => {
    if (!store) return;

    return () => store.reset();
  }, []);

  const sliceView = useMemo(
    () => [{ sliceID: Model.model.id, variationID: variation.id }],
    [Model.model.id, variation.id]
  );

  const onTakingCustomScreenshot = () => {
    checkSimulatorSetup(true, () =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      store
        .variation(variation.id)
        .generateScreenShot(Model.from, Model.model.name, setData)
    );
  };

  return (
    <Box sx={{ flex: 1 }}>
      <Header
        Model={Model}
        store={store}
        variation={variation}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        onPush={() => void store.push(Model, onPush)}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        onSave={() => void store.save(Model, setData)}
        isLoading={data.loading}
        imageLoading={data.imageLoading}
        hasModelErrors={Object.keys(currentVariationModelErrors).length > 0}
      />
      <FlexEditor
        sx={{ py: 4 }}
        SideBar={
          <SideBar
            Model={Model}
            variation={variation}
            onScreenshot={onTakingCustomScreenshot}
            onHandleFile={(file) =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              store
                .variation(variation.id)
                .generateCustomScreenShot(
                  Model.from,
                  Model.model.name,
                  setData,
                  file
                )
            }
            imageLoading={data.imageLoading}
          />
        }
      >
        <FieldZones
          Model={Model}
          store={store}
          variation={variation}
          modelErrors={currentVariationModelErrors}
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

export default SliceBuilder;
