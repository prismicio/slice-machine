import { useEffect, useMemo, useState } from "react";
import {
  SharedSliceEditor,
  defaultSharedSliceContent,
} from "@prismicio/editor-fields";

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
import { ScreenDimensions } from "@lib/models/common/Screenshots";
import { Slices } from "@slicemachine/core/build/models";
import { renderSliceMock } from "@prismicio/mocks";

import { ThemeProvider } from "@prismicio/editor-ui";

import { SharedSliceContent } from "@prismicio/types-internal/lib/content/fields/slices/SharedSliceContent";

import throttle from "lodash.throttle";

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

  const [screenDimensions, setScreenDimensions] = useState<ScreenDimensions>(
    ScreenSizes[ScreenSizeOptions.DESKTOP]
  );

  if (!component || !variation) {
    return <div />;
  }

  const sharedSlice = useMemo(
    () => Slices.fromSM(component.model),
    [component.model]
  );

  const initialContent = useMemo<SharedSliceContent>(
    () =>
      component.mock?.[0] ||
      (defaultSharedSliceContent(variation.id) as SharedSliceContent),
    [component.mock, variation.id]
  );

  const [editorContent, setContent] = useState(initialContent);
  const initialApiContent = useMemo(
    () =>
      renderSliceMock(sharedSlice, editorContent) as {
        id: string;
        [k: string]: unknown;
      },
    []
  );

  const [prevVariationId, setPrevVariationId] = useState(variation.id);
  if (variation.id !== prevVariationId) {
    setContent(initialContent);
    setPrevVariationId(variation.id);
  }

  const apiContent = useMemo(
    () =>
      throttle(() => {
        return {
          ...(renderSliceMock(sharedSlice, editorContent) as object),
          id: initialApiContent.id,
        };
      }, 100),
    [sharedSlice, editorContent, initialContent]
  );

  const [isDisplayEditor, toggleIsDisplayEditor] = useState(true);

  return (
    <Flex sx={{ flexDirection: "column", height: "100vh" }}>
      <Header
        slice={component}
        variation={variation}
        isDisplayEditor={isDisplayEditor}
        toggleIsDisplayEditor={() => toggleIsDisplayEditor(!isDisplayEditor)}
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
              apiContent={apiContent()}
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
                    width: "400px",
                  }
                : {
                    marginLeft: "0px",
                    visibility: "hidden",
                    width: "0",
                  }),
              transition: "visibility 0s linear",
            }}
          >
            <ThemeProvider>
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
          sliceName={Router.router?.query.sliceName as string}
          screenshotUrl={component.screenshots[variation.id]?.url}
        />
      )}
    </Flex>
  );
}
