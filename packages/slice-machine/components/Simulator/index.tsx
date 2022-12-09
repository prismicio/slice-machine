import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SharedSliceEditor } from "@prismicio/editor-fields";

import { defaultSharedSliceContent } from "@src/utils/editor";

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
import { Slices, VariationSM } from "@slicemachine/core/build/models";
import { renderSliceMock } from "@prismicio/mocks";

import { ThemeProvider } from "@prismicio/editor-ui";

import { SharedSliceContent } from "@prismicio/types-internal/lib/content/fields/slices/SharedSliceContent";

import useThrottle from "@src/hooks/useThrottle";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { ComponentUI } from "@lib/models/common/ComponentUI";

export default function Simulator() {
  const router = useRouter();

  const { component, framework, version, simulatorUrl } = useSelector(
    (store: SliceMachineStoreType) => ({
      component: selectCurrentSlice(
        store,
        router.query.lib as string,
        router.query.sliceName as string
      ),
      framework: getFramework(store),
      simulatorUrl: selectSimulatorUrl(store),
      version: getCurrentVersion(store),
    })
  );

  const variation = component?.model.variations.find(
    (variation) => variation.id === (router.query.variation as string)
  );

  useEffect(() => {
    void Tracker.get().trackOpenSliceSimulator(framework, version);
  }, []);

  if (!component || !variation) {
    return <div />;
  } else {
    return (
      <SimulatorForSlice
        component={component}
        variation={variation}
        simulatorUrl={simulatorUrl}
      />
    );
  }
}

type SimulatorForSliceProps = {
  component: ComponentUI;
  variation: VariationSM;
  simulatorUrl?: string;
};
const SimulatorForSlice: React.FC<SimulatorForSliceProps> = ({
  component,
  variation,
  simulatorUrl,
}) => {
  const { saveSliceMock } = useSliceMachineActions();
  const [screenDimensions, setScreenDimensions] = useState<ScreenDimensions>(
    ScreenSizes[ScreenSizeOptions.DESKTOP]
  );

  const sharedSlice = useMemo(
    () => Slices.fromSM(component.model),
    [component.model]
  );

  const initialContent = useMemo<SharedSliceContent>(
    () =>
      component.mock?.find((m) => m.variation === variation.id) ||
      defaultSharedSliceContent(variation.id),
    [component.mock, variation.id]
  );

  const previousInitialContent = useRef(initialContent);
  const [editorContent, setContent] = useState(initialContent);

  if (previousInitialContent.current !== initialContent) {
    previousInitialContent.current = initialContent;
    setContent(initialContent);
  }

  const initialApiContent = useMemo(
    () =>
      renderSliceMock(sharedSlice, editorContent) as {
        id: string;
        [k: string]: unknown;
      },
    []
  );

  const renderSliceMockCb = useCallback(
    () => () => ({
      // cast as object because type is unknown
      ...(renderSliceMock(sharedSlice, editorContent) as object),
      id: initialApiContent.id,
    }),
    [sharedSlice, editorContent, initialApiContent]
  );

  const apiContent = useThrottle(renderSliceMockCb, 800, [
    sharedSlice,
    editorContent,
  ]);

  const [isDisplayEditor, toggleIsDisplayEditor] = useState(true);

  return (
    <Flex sx={{ flexDirection: "column", height: "100vh" }}>
      <Header
        slice={component}
        variation={variation}
        isDisplayEditor={isDisplayEditor}
        toggleIsDisplayEditor={() => toggleIsDisplayEditor(!isDisplayEditor)}
        onSaveMock={() =>
          saveSliceMock({
            sliceName: component.model.name,
            libraryName: component.from,
            mock: (component.mock || [])
              .filter((mock) => mock.variation !== initialContent.variation)
              .concat(editorContent),
          })
        }
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
        <Flex
          sx={{
            flex: 1,
            flexDirection: "row",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          <Box
            sx={{
              width: "100%",
            }}
          >
            <Toolbar
              slice={component}
              variation={variation}
              handleScreenSizeChange={setScreenDimensions}
              screenDimensions={screenDimensions}
            />
            <IframeRenderer
              apiContent={apiContent}
              screenDimensions={screenDimensions}
              simulatorUrl={simulatorUrl}
            />
          </Box>
          <Box
            sx={{
              height: "100%",
              overflowY: "scroll",
              ...(isDisplayEditor
                ? {
                    marginLeft: "16px",
                    visibility: "visible",
                    flexShrink: 0,
                    width: "560px",
                  }
                : {
                    marginLeft: "0px",
                    visibility: "hidden",
                    width: "0",
                  }),
              transition: "visibility 0s linear",
            }}
          >
            <ThemeProvider mode="light">
              <SharedSliceEditor
                content={editorContent}
                onContentChange={(c) => setContent(c as SharedSliceContent)}
                sharedSlice={sharedSlice}
              />
            </ThemeProvider>
          </Box>
        </Flex>
      </Box>
      {!!component.screenshots[variation.id]?.url && (
        <ScreenshotPreviewModal
          sliceName={component.model.name}
          screenshotUrl={component.screenshots[variation.id]?.url}
        />
      )}
    </Flex>
  );
};
