import { RefCallback, useCallback, useEffect, useRef, useState } from "react";

import { Box, Flex } from "theme-ui";

import { SimulatorClient } from "@prismicio/slice-simulator-com";
import { SliceView } from "../..";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { SetupError } from "../SetupError";
import { ScreenDimensions } from "@lib/models/common/Screenshots";

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
          await clientRef.current?.connect(true);
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
  screenDimensions: ScreenDimensions;
  simulatorUrl: string | undefined;
  sliceView: SliceView;
  dryRun?: boolean;
};

const IframeRenderer: React.FunctionComponent<IframeRendererProps> = ({
  screenDimensions,
  simulatorUrl,
  sliceView,
  dryRun = false,
}) => {
  const [client, ref] = useSimulatorClient();
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
      await client.setSliceZoneFromSliceIDs(sliceView);
    };
    updateSliceZone()
      .then(() => {
        connectToSimulatorSuccess();
      })
      .catch(() => {
        connectToSimulatorFailure();
      });
  }, [client, screenDimensions, sliceView]);

  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: "white",
        height: "100%",
        border: "1px solid #DCDBDD",
        borderRadius: 8,
        ...(dryRun ? { visibility: "hidden" } : {}),
      }}
    >
      <Flex
        sx={{
          height: "100%",
          backgroundImage: "url(/pattern.png)",
          backgroundColor: "headSection",
          backgroundRepeat: "repeat",
          backgroundSize: "10px",
          border: "1px solid #DCDBDD;",
          width: "fit-content",
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
            width: screenDimensions.width,
            height: screenDimensions.height,
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
          {simulatorUrl ? (
            <iframe
              ref={ref}
              src={simulatorUrl}
              style={{
                border: "none",
                height: "100%",
                width: "100%",
              }}
            />
          ) : (
            <SetupError />
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default IframeRenderer;
