import { SimulatorClient } from "@prismicio/simulator";
import { RefCallback, useCallback, useEffect, useRef, useState } from "react";
import { Flex } from "theme-ui";

import { useElementSize } from "@/hooks/useElementSize";
import { ScreenDimensions } from "@/legacy/lib/models/common/Screenshots";

function useSimulatorClient(): readonly [
  SimulatorClient | undefined,
  RefCallback<HTMLIFrameElement>,
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
  isScreenshot?: boolean;
  handleSimulatorConnectionResult: (result: "successful" | "failed") => void;
};

const IframeRenderer: React.FunctionComponent<IframeRendererProps> = ({
  apiContent,
  screenDimensions: iframeSize,
  simulatorUrl,
  dryRun = false,
  isScreenshot = false,
  handleSimulatorConnectionResult,
}) => {
  const [client, iframeRef] = useSimulatorClient();

  useEffect((): void => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!simulatorUrl) {
      handleSimulatorConnectionResult("failed");
      return;
    }
    if (client === undefined) {
      return;
    }

    if (!client.connected) {
      handleSimulatorConnectionResult("failed");
      console.warn("Trying to use a disconnected simulator client.");
      return;
    }

    const updateSliceZone = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await client.setSliceZone([apiContent as any]);
    };

    updateSliceZone()
      .then(() => {
        handleSimulatorConnectionResult("successful");
      })
      .catch(() => {
        handleSimulatorConnectionResult("failed");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, apiContent, simulatorUrl]);

  const [viewportSize, setViewportSize] = useState<ScreenDimensions>();
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
        border: isScreenshot
          ? undefined
          : (t) => `1px solid ${String(t.colors?.darkBorder)}`,
        borderRadius: isScreenshot ? undefined : 8,
        display: "flex",
        height: "100%",
        justifyContent: "center",
        overflow: "hidden",
        ...(dryRun ? { display: "none" } : {}),
      }}
    >
      {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
      {simulatorUrl ? (
        <iframe
          ref={iframeRef}
          src={simulatorUrl}
          style={{
            border: "none",
            maxHeight: `${iframeSize.height}px`,
            maxWidth: `${iframeSize.width}px`,
            minHeight: `${iframeSize.height}px`,
            minWidth: `${iframeSize.width}px`,
            overflowY: "auto",
            ...(viewportSize
              ? { transform: `scale(${getScaling(iframeSize, viewportSize)})` }
              : { display: "none" }),
          }}
        />
      ) : null}
    </Flex>
  );
};

export function getScaling(
  { height: iframeHeight, width: iframeWidth }: ScreenDimensions,
  { height: viewportHeight, width: viewportWidth }: ScreenDimensions,
): number {
  if (iframeWidth > viewportWidth || iframeHeight > viewportHeight) {
    return iframeWidth - viewportWidth > iframeHeight - viewportHeight
      ? viewportWidth / iframeWidth
      : viewportHeight / iframeHeight;
  } else {
    return 1;
  }
}

export default IframeRenderer;
