import React, { useState, useEffect } from "react";

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
import { selectIsWaitingForIFrameCheck } from "@src/modules/simulator";
import { useRouter } from "next/router";
import {
  isSelectedSliceTouched,
  selectCurrentSlice,
} from "@src/modules/selectedSlice/selectors";
import { VariationSM } from "@prismic-beta/slicemachine-core/build/models";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { getRemoteSlice } from "@src/modules/slices";
import { useModelStatus } from "@src/hooks/useModelStatus";
import {
  ScreenSizeOptions,
  ScreenSizes,
} from "@components/Simulator/components/Toolbar/ScreensizeInput";
import useEditorContentOnce from "@src/hooks/useEditorContent";

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
  const { openToaster, saveSlice } = useSliceMachineActions();
  const { simulatorUrl, isWaitingForIframeCheck, isTouched, remoteSlice } =
    useSelector((store: SliceMachineStoreType) => ({
      simulatorUrl: selectSimulatorUrl(store),
      isWaitingForIframeCheck: selectIsWaitingForIFrameCheck(store),
      isTouched: isSelectedSliceTouched(
        store,
        component.from,
        component.model.id
      ),
      remoteSlice: getRemoteSlice(store, component.model.id),
    }));

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

  if (!variation) return null;

  const { apiContent } = useEditorContentOnce({
    slice: component,
    variationID: variation.id,
  });

  const onSaveSlice = () => {
    saveSlice(component, setData);
  };

  const { modelsStatuses } = useModelStatus([
    {
      local: component.model,
      remote: remoteSlice,
      localScreenshots: component.screenshots,
    },
  ]);

  return (
    <Box sx={{ flex: 1 }}>
      <Header
        component={component}
        status={modelsStatuses.slices[component.model.id]}
        isTouched={isTouched}
        variation={variation}
        onSave={onSaveSlice}
        isLoading={data.loading}
        imageLoading={data.imageLoading}
      />
      <FlexEditor
        sx={{ py: 4 }}
        SideBar={<SideBar component={component} variation={variation} />}
      >
        <FieldZones mockConfig={component.mockConfig} variation={variation} />
      </FlexEditor>
      <SetupDrawer />
      {isWaitingForIframeCheck && (
        <IframeRenderer
          dryRun
          simulatorUrl={simulatorUrl}
          apiContent={apiContent}
          screenDimensions={ScreenSizes[ScreenSizeOptions.DESKTOP]}
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
