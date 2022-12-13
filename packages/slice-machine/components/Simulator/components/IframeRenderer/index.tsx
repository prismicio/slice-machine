import { RefCallback, useCallback, useEffect, useRef, useState } from "react";

import { Box, Flex } from "theme-ui";
import { ThemeUIStyleObject } from "@theme-ui/css";

import { SimulatorClient } from "@prismicio/slice-simulator-com";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { ScreenDimensions } from "@lib/models/common/Screenshots";
import { useSelector } from "react-redux";
import {
  selectIframeStatus,
  selectIsWaitingForIFrameCheck,
} from "@src/modules/simulator";
import { SliceMachineStoreType } from "@src/redux/type";

function useSimulatorClient(): readonly [
  SimulatorClient | undefined,
  RefCallback<HTMLIFrameElement>
] {
  const [client, setClient] = useState<SimulatorClient | undefined>();
  const clientRef = useRef<SimulatorClient>();
  const observerRef = useRef<MutationObserver>();
  const iframeRef = useCallback(async (element: HTMLIFrameElement | null) => {
    clientRef.current?.disconnect();
    observerRef.current?.disconnect();
    setClient(undefined);
    if (element != null) {
      clientRef.current = new SimulatorClient(element);
      try {
        await clientRef.current.connect();
        setClient(clientRef.current);
        const reconnect = async () => {
          setClient(undefined);
          await clientRef.current?.connect({}, true);
          setClient(clientRef.current);
        };
        observerRef.current = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === "src") {
              reconnect().catch((error) => {
                throw error;
              });
            }
          });
        });
        observerRef.current.observe(element, { attributeFilter: ["src"] });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);
  return [client, iframeRef];
}

type IframeRendererProps = {
  apiContent?: unknown;
  screenDimensions: ScreenDimensions;
  simulatorUrl: string | undefined;
  dryRun?: boolean;
  sx?: ThemeUIStyleObject;
};

const IframeRenderer: React.FunctionComponent<IframeRendererProps> = ({
  apiContent,
  screenDimensions,
  simulatorUrl,
  dryRun = false,
  sx,
}) => {
  const [client, refCallback] = useSimulatorClient();
  const [triggerReload, setTriggerReload] = useState<number>(1);

  const { iframeStatus, isWaitingForIFrameCheck } = useSelector(
    (state: SliceMachineStoreType) => ({
      iframeStatus: selectIframeStatus(state),
      isWaitingForIFrameCheck: selectIsWaitingForIFrameCheck(state),
    })
  );

  const { connectToSimulatorSuccess, connectToSimulatorFailure } =
    useSliceMachineActions();

  useEffect((): void => {
    if (!simulatorUrl) {
      connectToSimulatorFailure();
      return;
    }
    if (client === undefined) {
      return;
    }

    if (!client.connected) {
      connectToSimulatorFailure();
      console.warn("Trying to use a disconnected simulator client.");
      return;
    }

    const updateSliceZone = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await client.setSliceZone([apiContent as any]);
    };

    updateSliceZone()
      .then(() => {
        connectToSimulatorSuccess();
      })
      .catch(() => {
        connectToSimulatorFailure();
      });
  }, [client, screenDimensions, apiContent, simulatorUrl]);

  useEffect(() => {
    if (!isWaitingForIFrameCheck && iframeStatus !== "ok") {
      setTriggerReload((n) => n + 1);
    }
  }, [iframeStatus, isWaitingForIFrameCheck]);

  // const [wrapperRef, { width: containerWidth }] = useElementSize();

  // const iframeScale =
  //   screenDimensions.width > containerWidth
  //     ? (containerWidth * 100) / screenDimensions.width
  //     : 100;

  return (
    <Box
      // ref={wrapperRef}
      sx={{
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        border: (t) => `1px solid ${String(t.colors?.darkBorder)}`,
        borderRadius: 8,
        overflow: "hidden",
        ...(dryRun ? { visibility: "hidden" } : {}),
        ...sx,
      }}
    >
      <Flex
        sx={{
          height: "100%",
          backgroundImage: "url(/pattern.png)",
          backgroundColor: "headSection",
          backgroundRepeat: "repeat",
          backgroundSize: "10px",
          border: (t) => `1px solid ${String(t.colors?.darkBorder)}`,
          mx: "auto",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Flex
          sx={{
            justifyContent: "center",
            margin: "0 auto",
            overflow: "auto",
            alignContent: "center",
            ...(dryRun
              ? {
                  position: "absolute",
                  top: "0",
                  width: "0",
                  height: "0",
                }
              : {}),
          }}
        >
          {client?.connected ? <div id="__iframe-ready" /> : null}
          {simulatorUrl ? (
            <iframe
              id="__iframe-renderer"
              ref={refCallback}
              key={triggerReload}
              src={simulatorUrl}
              style={{
                border: "none",
                // transform: `scale(${iframeScale}%)`,
                // width: screenDimensions.width,
                // height: screenDimensions.height,
              }}
            />
          ) : null}
        </Flex>
      </Flex>
    </Box>
  );
};

export default IframeRenderer;
