import { RefCallback, useCallback, useEffect, useRef, useState } from "react";

import { Box, Flex } from "theme-ui";

import { SimulatorClient } from "@prismicio/slice-simulator-com";
import { Size, iframeSizes } from "../ScreenSizes";
import { SliceView } from "../..";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { SetupError } from "../SetupError";

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
  size: Size;
  simulatorUrl: string | undefined;
  sliceView: SliceView;
  dryRun?: boolean;
};

const IframeRenderer: React.FunctionComponent<IframeRendererProps> = ({
  size,
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
  }, [client, size, sliceView]);

  return (
    <Box
      sx={{
        flex: "1",
        bg: "grey01",
        ...(dryRun ? { visibility: "hidden" } : {}),
      }}
    >
      <Flex
        sx={{
          justifyContent: "center",
          borderTop: "1px solid #F1F1F1",
          margin: "0 auto",
          overflow: "auto",
          ...iframeSizes[size],
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
    </Box>
  );
};

export default IframeRenderer;
