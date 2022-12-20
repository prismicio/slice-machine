import { RefCallback, useCallback, useEffect, useRef, useState } from "react";

import { Flex } from "theme-ui";

import { SimulatorClient } from "@prismicio/slice-simulator-com";
import { useElementSize } from "@src/hooks/useElementSize";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
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
};

const IframeRenderer: React.FunctionComponent<IframeRendererProps> = ({
  apiContent,
  screenDimensions: iframeSize,
  simulatorUrl,
  dryRun = false,
}) => {
  const [client, iframeRef] = useSimulatorClient();

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
  }, [client, apiContent, simulatorUrl]);

  const [viewportSize, setViewportSize] = useState<ScreenDimensions>({
    height: 0,
    width: 0,
  });
  const viewportRef = useElementSize(({ blockSize, inlineSize }) => {
    setViewportSize({ height: blockSize, width: inlineSize });
  }, []);

  return (
    <Flex
      ref={viewportRef}
      sx={{
        alignItems: "center",
        backgroundColor: "headSection",
        backgroundImage: "url(/pattern.png)",
        backgroundRepeat: "repeat",
        backgroundSize: "10px",
        border: (t) => `1px solid ${String(t.colors?.darkBorder)}`,
        borderRadius: 8,
        display: "flex",
        height: "100%",
        justifyContent: "center",
        overflowY: "hidden",
        ...(dryRun ? { display: "none" } : {}),
      }}
    >
      {simulatorUrl ? (
        <iframe
          id="__iframe-renderer"
          ref={iframeRef}
          src={simulatorUrl}
          style={{
            border: "none",
            maxHeight: `${iframeSize.height}px`,
            maxWidth: `${iframeSize.width}px`,
            minHeight: `${iframeSize.height}px`,
            minWidth: `${iframeSize.width}px`,
            overflowY: "auto",
            transform: `scale(${getScaling(iframeSize, viewportSize)})`,
          }}
        />
      ) : null}
      {client?.connected ? <div id="__iframe-ready" /> : null}
    </Flex>
  );
};

function getScaling(
  { height: iframeHeight, width: iframeWidth }: ScreenDimensions,
  { height: viewportHeight, width: viewportWidth }: ScreenDimensions
): number {
  const widthDiff = iframeWidth - viewportWidth;
  const heightDiff = iframeHeight - viewportHeight;
  if (iframeWidth > viewportWidth && widthDiff > heightDiff) {
    return viewportWidth / iframeWidth;
  } else if (iframeHeight > viewportHeight && heightDiff > widthDiff) {
    return viewportHeight / iframeHeight;
  } else {
    return 1;
  }
}

export default IframeRenderer;
