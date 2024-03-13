import {
  FC,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EditorConfig, SharedSliceEditor } from "@prismicio/editor-fields";
import { DefaultErrorMessage } from "@prismicio/editor-ui";
import { toast } from "react-toastify";

import { defaultSharedSliceContent } from "@src/utils/editor";

import { BaseStyles, Box, Flex, Spinner } from "theme-ui";

import Header from "./components/Header";

import { saveSliceMock, telemetry } from "@src/apiClient";
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
import {
  selectIframeStatus,
  selectIsWaitingForIFrameCheck,
} from "@src/modules/simulator";
import { ErrorBoundary } from "@src/ErrorBoundary";

import FullPage from "./components/FullPage";
import FailedConnect from "./components/FailedConnect";
import { Slices, VariationSM } from "@lib/models/common/Slice";
import { ComponentUI } from "@lib/models/common/ComponentUI";

export enum UiState {
  LOADING_IFRAME = "LOADING_IFRAME",
  FAILED_CONNECT = "FAILED_CONNECT",
  SUCCESS = "SUCCESS",
}

type SimulatorProps = {
  slice: ComponentUI;
  variation: VariationSM;
};

const Simulator: FC<SimulatorProps> = ({ slice, variation }) => {
  const { connectToSimulatorIframe, updateSliceMockSuccess } =
    useSliceMachineActions();
  const { simulatorUrl, iframeStatus, isWaitingForIFrameCheck, endpoints } =
    useSelector((state: SliceMachineStoreType) => ({
      simulatorUrl: selectSimulatorUrl(state),
      iframeStatus: selectIframeStatus(state),
      isWaitingForIFrameCheck: selectIsWaitingForIFrameCheck(state),
      endpoints: selectEndpoints(state),
    }));

  const editorConfig: EditorConfig = useMemo(
    () => ({
      embedsUrl: endpoints.PrismicOembed,
      env: "prod",
      unsplashUrl: endpoints.PrismicUnsplash,
    }),
    [endpoints.PrismicOembed, endpoints.PrismicUnsplash],
  );

  useEffect(() => {
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
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (isWaitingForIFrameCheck || !iframeStatus) {
      return UiState.LOADING_IFRAME;
    }
    if (iframeStatus !== "ok") {
      return UiState.FAILED_CONNECT;
    }
    return UiState.SUCCESS;
  })();

  useEffect(() => {
    connectToSimulatorIframe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    ScreenSizes[ScreenSizeOptions.DESKTOP],
  );

  const sharedSlice = useMemo(() => Slices.fromSM(slice.model), [slice.model]);

  // state used only to store updates coming from the editor
  const [editorState, setEditorState] = useState<SharedSliceContent | null>(
    null,
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
    [],
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
    [sharedSlice, editorContent],
  );

  const apiContent = useThrottle(renderSliceMockCb, 800, [
    sharedSlice,
    editorContent,
  ]);

  const [isDisplayEditor, toggleIsDisplayEditor] = useState(false);
  const [isSavingMock, setIsSavingMock] = useState(false);

  const saveMock = async () => {
    if (editorState) {
      setIsSavingMock(true);

      try {
        const payload = {
          libraryID: slice.from,
          sliceID: slice.model.id,
          mocks: (slice.mocks ?? [])
            .filter((mock) => mock.variation !== editorState.variation)
            .concat(editorState),
        };
        const { errors } = await saveSliceMock(payload);

        if (errors.length > 0) {
          throw errors;
        }

        updateSliceMockSuccess(payload);
        toast.success("Saved");
      } catch (error) {
        console.error("Error while saving mock", error);
        toast.error("Error saving content");
      }

      setIsSavingMock(false);
    }
  };

  return (
    <Flex sx={{ flexDirection: "column", height: "100vh" }}>
      <Header
        slice={slice}
        variation={variation}
        isDisplayEditor={isDisplayEditor}
        actionsDisabled={currentState !== UiState.SUCCESS}
        toggleIsDisplayEditor={() => toggleIsDisplayEditor(!isDisplayEditor)}
        onSaveMock={() => void saveMock()}
        isSavingMock={isSavingMock}
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
          {currentState === UiState.SUCCESS && isDisplayEditor ? (
            <Flex
              className="editor"
              sx={{
                flexDirection: "column",
                marginLeft: "16px",
                maxWidth: "440px",
                minWidth: "440px",
                overflowY: "auto",
              }}
            >
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
            </Flex>
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
