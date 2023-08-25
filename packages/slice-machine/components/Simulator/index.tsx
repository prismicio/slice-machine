import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EditorConfig, SharedSliceEditor } from "@prismicio/editor-fields";
import { DefaultErrorMessage, ErrorBoundary } from "@prismicio/editor-ui";

import { defaultSharedSliceContent } from "@src/utils/editor";

import { BaseStyles, Box, Flex, Spinner } from "theme-ui";

import Header from "./components/Header";

import { telemetry } from "@src/apiClient";
import { useSelector } from "react-redux";
import { selectEndpoints, selectSimulatorUrl } from "@src/modules/environment";
import { SliceMachineStoreType } from "@src/redux/type";
import { Toolbar } from "./components/Toolbar";
import {
  ScreenSizeOptions,
  ScreenSizes,
} from "./components/Toolbar/ScreensizeInput";
import { ScreenDimensions } from "@lib/models/common/Screenshots";
import ScreenshotPreviewModal from "@components/ScreenshotPreviewModal";
import { renderSliceMock } from "@prismicio/mocks";

import { SharedSliceContent } from "@prismicio/types-internal/lib/content";

import useThrottle from "@src/hooks/useThrottle";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

import IframeRenderer from "./components/IframeRenderer";
import { ComponentWithSliceProps } from "@src/layouts/WithSlice";
import {
  selectIframeStatus,
  selectIsWaitingForIFrameCheck,
  selectSetupStatus,
} from "@src/modules/simulator";

import FullPage from "./components/FullPage";
import FailedConnect from "./components/FailedConnect";
import SetupModal from "./components/SetupModal";
import { Slices } from "@lib/models/common/Slice";

export enum UiState {
  LOADING_SETUP = "LOADING_SETUP",
  LOADING_IFRAME = "LOADING_IFRAME",
  FAILED_SETUP = "FAILED_SETUP",
  FAILED_CONNECT = "FAILED_CONNECT",
  SUCCESS = "SUCCESS",
}

const Simulator: ComponentWithSliceProps = ({ slice, variation }) => {
  const { checkSimulatorSetup, connectToSimulatorIframe, saveSliceMock } =
    useSliceMachineActions();
  const {
    simulatorUrl,
    iframeStatus,
    manifestStatus,
    isWaitingForIFrameCheck,
    endpoints,
  } = useSelector((state: SliceMachineStoreType) => ({
    simulatorUrl: selectSimulatorUrl(state),
    iframeStatus: selectIframeStatus(state),
    manifestStatus: selectSetupStatus(state).manifest,
    isWaitingForIFrameCheck: selectIsWaitingForIFrameCheck(state),
    endpoints: selectEndpoints(state),
  }));

  const editorConfig: EditorConfig = useMemo(
    () => ({
      embedsUrl: endpoints.PrismicOembed,
      env: "prod",
      unsplashUrl: endpoints.PrismicUnsplash,
    }),
    [endpoints.PrismicOembed, endpoints.PrismicUnsplash]
  );

  const setupIntervalId = useRef<NodeJS.Timeout | null>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkSimulatorSetupCb = useCallback(() => checkSimulatorSetup(), []);

  useEffect(() => {
    checkSimulatorSetup();
    void telemetry.track({ event: "slice-simulator:open" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startedNewEditorSessionRef = useRef(false);

  useEffect(() => {
    startedNewEditorSessionRef.current = true;
  }, []);

  const trackWidgetUsed = (sliceId: string) => {
    if (!startedNewEditorSessionRef.current) return;
    startedNewEditorSessionRef.current = false;
    void telemetry.track({ event: "editor:widget-used", sliceId });
  };

  const currentState: UiState = (() => {
    if (manifestStatus === "ko") {
      return UiState.FAILED_SETUP;
    }
    if (manifestStatus === "ok") {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (isWaitingForIFrameCheck || !iframeStatus) {
        return UiState.LOADING_IFRAME;
      }
      if (iframeStatus !== "ok") {
        return UiState.FAILED_CONNECT;
      }
      return UiState.SUCCESS;
    }
    return UiState.LOADING_SETUP;
  })();

  useEffect(() => {
    if (currentState === UiState.FAILED_SETUP && !setupIntervalId.current) {
      const id = setInterval(() => {
        checkSimulatorSetupCb();
      }, 3000);
      setupIntervalId.current = id;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentState]);

  useEffect(() => {
    if (manifestStatus === "ok") {
      if (setupIntervalId.current) {
        clearInterval(setupIntervalId.current);
      }
      connectToSimulatorIframe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifestStatus]);

  useEffect(() => {
    if (currentState === UiState.FAILED_CONNECT) {
      void telemetry.track({ event: "slice-simulator:is-not-running" });
    }
  }, [currentState]);

  useEffect(() => {
    if (currentState === UiState.SUCCESS) {
      toggleIsDisplayEditor(true);
    }
  }, [currentState]);

  const onRetrigger = () => {
    connectToSimulatorIframe();
  };

  const [screenDimensions, setScreenDimensions] = useState<ScreenDimensions>(
    ScreenSizes[ScreenSizeOptions.DESKTOP]
  );

  const sharedSlice = useMemo(() => Slices.fromSM(slice.model), [slice.model]);

  // state used only to store updates coming from the editor
  const [editorState, setEditorState] = useState<SharedSliceContent | null>(
    null
  );

  // computed state that takes the editorState if any change
  // for the current variation or directly the mocks
  const editorContent = useMemo(() => {
    if (editorState?.variation === variation.id) return editorState;

    return (
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      slice.mocks?.find((m) => m.variation === variation.id) ||
      defaultSharedSliceContent(variation.id)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorState, variation.id]);

  // this is temporary, it allows to retain the slice ID generated
  //at first render so we don't trigger too many re-render at each content change
  const renderedSliceId = useMemo(
    () =>
      (
        renderSliceMock(sharedSlice, editorContent) as {
          id: string;
          [k: string]: unknown;
        }
      ).id,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // When the content change, we re-render the content but overwrite the newly
  // generated slice ID by the initial one for render optim
  const renderSliceMockCb = useCallback(
    () => () => ({
      // cast as object because type is unknown
      ...(renderSliceMock(sharedSlice, editorContent) as object),
      id: renderedSliceId,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sharedSlice, editorContent]
  );

  const apiContent = useThrottle(renderSliceMockCb, 800, [
    sharedSlice,
    editorContent,
  ]);

  const [isDisplayEditor, toggleIsDisplayEditor] = useState(false);

  return (
    <Flex sx={{ flexDirection: "column", height: "100vh" }}>
      <SetupModal isOpen={currentState === UiState.FAILED_SETUP} />
      <Header
        slice={slice}
        variation={variation}
        isDisplayEditor={isDisplayEditor}
        actionsDisabled={currentState !== UiState.SUCCESS}
        toggleIsDisplayEditor={() => toggleIsDisplayEditor(!isDisplayEditor)}
        onSaveMock={() =>
          editorState &&
          saveSliceMock({
            libraryID: slice.from,
            sliceID: slice.model.id,
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            mocks: (slice.mocks || [])
              .filter((mock) => mock.variation !== editorState.variation)
              .concat(editorState),
          })
        }
      />
      <Box
        sx={{
          flex: 1,
          bg: "grey07",
          p: 3,
          display: "flex",
          flexDirection: "column",
          height: "calc(100% - 73px - 16px)",
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
          <BaseStyles
            sx={{
              display: "flex",
              height: "100%",
              flexDirection: "column",
              flex: 1,
              minWidth: 0,
            }}
          >
            <Toolbar
              slice={slice}
              variation={variation}
              handleScreenSizeChange={setScreenDimensions}
              screenDimensions={screenDimensions}
              actionsDisabled={currentState !== UiState.SUCCESS}
            />
            {currentState === UiState.FAILED_CONNECT ? (
              <FailedConnect onRetrigger={onRetrigger} />
            ) : null}
            {currentState === UiState.SUCCESS ? (
              <IframeRenderer
                apiContent={apiContent}
                screenDimensions={screenDimensions}
                simulatorUrl={simulatorUrl}
              />
            ) : (
              <>
                {currentState === UiState.LOADING_IFRAME ? (
                  <FullPage>
                    <Spinner variant="styles.spinner" />
                    <IframeRenderer
                      apiContent={apiContent}
                      screenDimensions={screenDimensions}
                      simulatorUrl={simulatorUrl}
                      dryRun
                    />
                  </FullPage>
                ) : null}
              </>
            )}
          </BaseStyles>
          {currentState === UiState.SUCCESS ? (
            <Box
              className="editor"
              sx={{
                marginLeft: "16px",
                maxWidth: "440px",
                minWidth: "440px",
                overflowY: "auto",
                ...(isDisplayEditor
                  ? { display: "flex", flexDirection: "column" }
                  : { display: "none" }),
              }}
            >
              {/*
                The editor warn us it's recommended to wrap  SharedSliceEditor in a Suspense and an ErrorBoundary.
                Warning: It is not recommended to use editor-support->Suspense without a editor-ui->ErrorBoundary above it
              */}
              <ErrorBoundary
                renderError={() => (
                  <DefaultErrorMessage
                    title="Editor error"
                    description="An error occurred while rendering the editor."
                  />
                )}
              >
                <Suspense>
                  <SharedSliceEditor
                    /**
                     * Because of a re-render issue on the richtext /* we
                     * enforce re-rendering the editor when the variation
                     * change. /* this change should be removed once the editor
                     * is fixed.
                     */
                    key={variation.id}
                    config={editorConfig}
                    content={editorContent}
                    onContentChange={(c) => {
                      setEditorState(c);
                      trackWidgetUsed(slice.model.id);
                    }}
                    sharedSlice={sharedSlice}
                  />
                </Suspense>
              </ErrorBoundary>
            </Box>
          ) : null}
        </Flex>
      </Box>
      {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
      {!!slice.screenshots[variation.id]?.url && (
        <ScreenshotPreviewModal
          sliceName={slice.model.name}
          screenshotUrl={slice.screenshots[variation.id]?.url}
        />
      )}
    </Flex>
  );
};

export default Simulator;
