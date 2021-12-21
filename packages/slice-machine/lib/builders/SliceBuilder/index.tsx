import React, { useState, useContext, useEffect, useMemo } from "react";
import { useToasts } from "react-toast-notifications";
import { useIsMounted } from "react-tidy";

import { handleRemoteResponse } from "src/ToastProvider/utils";
import { SliceContext } from "src/models/slice/context";

import { Box } from "theme-ui";

import FieldZones from "./FieldZones";
import FlexEditor from "./FlexEditor";
import SideBar from "./SideBar";
import Header from "./Header";

import useSliceMachineActions from "src/modules/useSliceMachineActions";
import SetupDrawer from "./SetupDrawer";
import IframeRenderer from "@components/Preview/components/IframeRenderer";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { selectCanvasUrl } from "@src/modules/environment";
import { Size } from "@components/Preview/components/ScreenSizes";
import { selectIsWaitingForIFrameCheck } from "@src/modules/preview";

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
  const { openLoginModal, checkPreviewSetup } = useSliceMachineActions();
  const { canvasUrl, isWaitingForIframeCheck } = useSelector(
    (state: SliceMachineStoreType) => ({
      canvasUrl: selectCanvasUrl(state),
      isWaitingForIframeCheck: selectIsWaitingForIFrameCheck(state),
    })
  );

  if (!store || !Model || !variation) return null;

  const { addToast } = useToasts();

  const isMounted = useIsMounted();
  // We need to move this state to somewhere global to update the UI if any action from anywhere save or update to the filesystem I'd guess
  const [data, setData] = useState<SliceBuilderState>(initialState);

  const onPush = (data: SliceBuilderState) => {
    setData(data);
    if (data.error && data.status === 403) {
      openLoginModal();
    }
  };

  useEffect(() => {
    if (Model.isTouched && isMounted) {
      setData(initialState);
    }
  }, [Model.isTouched]);

  // activate/deactivate Success message
  useEffect(() => {
    if (data.done && isMounted) {
      // @ts-expect-error
      handleRemoteResponse(addToast)(data);
    }
  }, [data]);

  useEffect(() => {
    if (!store) return;

    return () => store.reset();
  }, []);

  const sliceView = useMemo(
    () => [{ sliceID: Model.infos.model.id, variationID: variation.id }],
    [Model.infos.model.id, variation.id]
  );

  const onTakingCustomScreenshot = () => {
    checkPreviewSetup(true, () =>
      store
        .variation(variation.id)
        .generateScreenShot(Model.from, Model.infos.sliceName, setData)
    );
  };

  return (
    <Box sx={{ flex: 1 }}>
      <Header
        Model={Model}
        store={store}
        variation={variation}
        // @ts-expect-error
        onPush={() => store.push(Model, onPush)}
        // @ts-expect-error
        onSave={() => store.save(Model, setData)}
        isLoading={data.loading}
      />
      <FlexEditor
        sx={{ py: 4 }}
        SideBar={
          <SideBar
            Model={Model}
            variation={variation}
            onScreenshot={onTakingCustomScreenshot}
            onHandleFile={(file) =>
              store
                .variation(variation.id)
                .generateCustomScreenShot(
                  Model.from,
                  Model.infos.sliceName,
                  setData,
                  file
                )
            }
            imageLoading={data.imageLoading}
          />
        }
      >
        <FieldZones Model={Model} store={store} variation={variation} />
      </FlexEditor>
      <SetupDrawer />
      {isWaitingForIframeCheck && (
        <IframeRenderer
          dryRun
          size={Size.FULL}
          canvasUrl={canvasUrl}
          sliceView={sliceView}
        />
      )}
    </Box>
  );
};

export default SliceBuilder;
