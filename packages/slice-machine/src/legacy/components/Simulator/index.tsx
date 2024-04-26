import { EditorConfig, SharedSliceEditor } from "@prismicio/editor-fields";
import { DefaultErrorMessage } from "@prismicio/editor-ui";
import { renderSliceMock } from "@prismicio/mocks";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";
import {
  FC,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { BaseStyles, Box, Flex, Spinner } from "theme-ui";

import { saveSliceMock, telemetry } from "@/apiClient";
import { ErrorBoundary } from "@/ErrorBoundary";
import useThrottle from "@/hooks/useThrottle";
import ScreenshotPreviewModal from "@/legacy/components/ScreenshotPreviewModal";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { ScreenDimensions } from "@/legacy/lib/models/common/Screenshots";
import { Slices, VariationSM } from "@/legacy/lib/models/common/Slice";
import { selectEndpoints, selectSimulatorUrl } from "@/modules/environment";
import useSliceMachineActions from "@/modules/useSliceMachineActions";
import { SliceMachineStoreType } from "@/redux/type";
import { defaultSharedSliceContent } from "@/utils/editor";

import FailedConnect from "./components/FailedConnect";
import FullPage from "./components/FullPage";
import Header from "./components/Header";
import IframeRenderer from "./components/IframeRenderer";
import { Toolbar } from "./components/Toolbar";
import {
  ScreenSizeOptions,
  ScreenSizes,
} from "./components/Toolbar/ScreensizeInput";

type SimulatorProps = {
  slice: ComponentUI;
  variation: VariationSM;
};

const IFRAME_CONNECTION_TIMEOUT = 20000;

const Simulator: FC<SimulatorProps> = ({ slice, variation }) => {
  const { updateSliceMockSuccess } = useSliceMachineActions();
  const { simulatorUrl, endpoints } = useSelector(
    (state: SliceMachineStoreType) => ({
      simulatorUrl: selectSimulatorUrl(state),
      endpoints: selectEndpoints(state),
    }),
  );

  const editorConfig: EditorConfig = useMemo(
    () => ({
      embedApiEndpoint: new URL(endpoints.PrismicEmbed),
      authStrategy: "cookie",
      unsplashApiBaseUrl: new URL(endpoints.PrismicUnsplash),
      baseUrl: new URL("builder/", endpoints.PrismicWroom),
    }),
    [endpoints.PrismicEmbed, endpoints.PrismicUnsplash, endpoints.PrismicWroom],
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

  const [iframeConnectionStatus, setIframeConnectionStatus] = useState<
    "waiting" | "successful" | "failed"
  >("waiting");

  useEffect(() => {
    if (iframeConnectionStatus === "waiting") {
      const timer = setTimeout(() => {
        setIframeConnectionStatus("failed");
      }, IFRAME_CONNECTION_TIMEOUT);

      return () => clearTimeout(timer);
    }
  }, [iframeConnectionStatus]);

  const handleSimulatorConnectionResult = (result: "successful" | "failed") => {
    if (iframeConnectionStatus !== "waiting") {
      return;
    }

    if (result === "failed") {
      void telemetry.track({ event: "slice-simulator:is-not-running" });
    } else {
      toggleIsDisplayEditor(true);
    }

    setIframeConnectionStatus(result);
  };

  const onRetrigger = () => {
    setIframeConnectionStatus("waiting");
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
        actionsDisabled={iframeConnectionStatus !== "successful"}
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
              actionsDisabled={iframeConnectionStatus !== "successful"}
            />
            {iframeConnectionStatus === "failed" ? (
              <FailedConnect onRetrigger={onRetrigger} />
            ) : null}
            {iframeConnectionStatus === "successful" ? (
              <IframeRenderer
                apiContent={apiContent}
                screenDimensions={screenDimensions}
                simulatorUrl={simulatorUrl}
                handleSimulatorConnectionResult={
                  handleSimulatorConnectionResult
                }
              />
            ) : (
              <>
                {iframeConnectionStatus === "waiting" ? (
                  <FullPage>
                    <Spinner variant="styles.spinner" />
                    <IframeRenderer
                      apiContent={apiContent}
                      screenDimensions={screenDimensions}
                      simulatorUrl={simulatorUrl}
                      dryRun
                      handleSimulatorConnectionResult={
                        handleSimulatorConnectionResult
                      }
                    />
                  </FullPage>
                ) : null}
              </>
            )}
          </BaseStyles>
          {iframeConnectionStatus === "successful" && isDisplayEditor ? (
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
