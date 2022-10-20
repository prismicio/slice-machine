import { useEffect, useMemo, useState } from "react";

import { Box, Flex } from "theme-ui";

import Header from "./components/Header";
import IframeRenderer from "./components/IframeRenderer";
import Tracker from "@src/tracking/client";
import { useSelector } from "react-redux";
import {
  getCurrentVersion,
  getFramework,
  selectSimulatorUrl,
} from "@src/modules/environment";
import { SliceMachineStoreType } from "@src/redux/type";
import { selectCurrentSlice } from "@src/modules/selectedSlice/selectors";
import Router from "next/router";
import ScreenshotPreviewModal from "@components/ScreenshotPreviewModal";
import { Toolbar } from "./components/Toolbar";
import {
  ScreenSizeOptions,
  ScreenSizes,
} from "./components/Toolbar/ScreensizeInput";

export type SliceView = SliceViewItem[];
export type SliceViewItem = Readonly<{ sliceID: string; variationID: string }>;

export default function Simulator() {
  const { component } = useSelector((store: SliceMachineStoreType) => ({
    component: selectCurrentSlice(
      store,
      Router.router?.query.lib as string,
      Router.router?.query.sliceName as string
    ),
  }));

  const variation = component?.model.variations.find(
    (variation) => variation.id === (Router.router?.query.variation as string)
  );

  const { framework, version, simulatorUrl } = useSelector(
    (state: SliceMachineStoreType) => ({
      framework: getFramework(state),
      simulatorUrl: selectSimulatorUrl(state),
      version: getCurrentVersion(state),
    })
  );

  useEffect(() => {
    void Tracker.get().trackOpenSliceSimulator(framework, version);
  }, []);

  const [screenWidth, setScreenWidth] = useState(
    ScreenSizes[ScreenSizeOptions.DESKTOP].width
  );
  const [screenHeight, setScreenHeight] = useState(
    ScreenSizes[ScreenSizeOptions.DESKTOP].height
  );

  const handleScreenWidthChange = (newScreenWidth: number) =>
    setScreenWidth(newScreenWidth);
  const handleScreenHeightChange = (newScreenHeight: number) =>
    setScreenHeight(newScreenHeight);

  if (!component || !variation) {
    return <div />;
  }

  const sliceView = useMemo(
    () => [
      {
        sliceID: component.model.id,
        variationID: variation.id,
      },
    ],
    [component.model.id, variation.id]
  );

  return (
    <Flex sx={{ height: "100vh", flexDirection: "column" }}>
      <Header
        Model={component}
        variation={variation}
        screenWidth={screenWidth}
        screenHeight={screenHeight}
      />
      <Box
        sx={{
          flex: 1,
          bg: "grey01",
          p: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Toolbar
          Model={component}
          variation={variation}
          handleScreenWidthChange={handleScreenWidthChange}
          handleScreenHeightChange={handleScreenHeightChange}
          width={screenWidth}
          height={screenHeight}
        />
        <IframeRenderer
          screenWidth={screenWidth}
          screenHeight={screenHeight}
          simulatorUrl={simulatorUrl}
          sliceView={sliceView}
        />
      </Box>
      {!!component.screenshots[variation.id]?.url && (
        <ScreenshotPreviewModal
          sliceName={Router.router?.query.sliceName as string}
          screenshotUrl={component.screenshots[variation.id]?.url}
        />
      )}
    </Flex>
  );
}
