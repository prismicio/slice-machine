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
import { useRouter } from "next/router";
import ScreenshotPreviewModal from "@components/ScreenshotPreviewModal";
import { Toolbar } from "./components/Toolbar";
import {
  ScreenSizeOptions,
  ScreenSizes,
} from "./components/Toolbar/ScreensizeInput";
import { ScreenDimensions } from "@lib/models/common/Screenshots";

export type SliceView = SliceViewItem[];
export type SliceViewItem = Readonly<{ sliceID: string; variationID: string }>;

export default function Simulator() {
  const router = useRouter();

  const { component } = useSelector((store: SliceMachineStoreType) => ({
    component: selectCurrentSlice(
      store,
      router.query.lib as string,
      router.query.sliceName as string
    ),
  }));

  const variation = component?.model.variations.find(
    (variation) => variation.id === (router.query.variation as string)
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

  const [screenDimensions, setScreenDimensions] = useState<ScreenDimensions>(
    ScreenSizes[ScreenSizeOptions.DESKTOP]
  );

  const sliceView = useMemo(() => {
    if (component?.model.id && variation?.id) {
      return [
        {
          sliceID: component.model.id,
          variationID: variation.id,
        },
      ];
    }
    return [];
  }, [component?.model.id, variation?.id]);

  if (!component || !variation) {
    return <div />;
  }

  return (
    <Flex sx={{ height: "100vh", flexDirection: "column" }}>
      <Header
        Model={component}
        variation={variation}
        screenDimensions={screenDimensions}
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
          handleScreenSizeChange={setScreenDimensions}
          screenDimensions={screenDimensions}
        />
        <Flex style={{ flex: 1, overflow: "scroll" }}>
          <IframeRenderer
            screenDimensions={screenDimensions}
            simulatorUrl={simulatorUrl}
            sliceView={sliceView}
          />
        </Flex>
      </Box>
      {!!component.screenshots[variation.id]?.url && (
        <ScreenshotPreviewModal
          sliceName={router.query.sliceName as string}
          screenshotUrl={component.screenshots[variation.id]?.url}
        />
      )}
    </Flex>
  );
}
