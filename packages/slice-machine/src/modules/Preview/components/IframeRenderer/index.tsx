import { RefCallback, useCallback, useEffect, useRef, useState } from "react";

import { Flex } from "theme-ui";

import { RendererClient } from "@prismicio/slice-canvas-com";
import { Size, iframeSizes } from "../ScreenSizes";
import { SliceView } from "../..";

function useRendererClient(): readonly [
  RendererClient | undefined,
  RefCallback<HTMLIFrameElement>
] {
  const [client, setClient] = useState<RendererClient | undefined>();
  const clientRef = useRef<RendererClient>();
  const observerRef = useRef<MutationObserver>();
  const iframeRef = useCallback(async (element: HTMLIFrameElement | null) => {
    clientRef.current?.disconnect();
    observerRef.current?.disconnect();
    setClient(undefined);
    if (element != null) {
      clientRef.current = new RendererClient(element);
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

export default function IframeRenderer({
  size,
  canvasUrl,
  sliceView,
}: {
  size: Size;
  canvasUrl: string;
  sliceView: SliceView;
}) {
  const [client, ref] = useRendererClient();
  useEffect(() => {
    if (client !== undefined) {
      if (client.connected) {
        const updateSliceZone = async () => {
          await client.setSliceZoneFromSliceIDs(sliceView);
        };
        updateSliceZone().catch((error) => {
          console.log({ error });
        });
      } else {
        console.warn("Trying to use a disconnected renderer client.");
      }
    }
  }, [client, size, sliceView]);

  return (
    <Flex
      sx={{
        justifyContent: "center",
        borderTop: "1px solid #F1F1F1",
        margin: "0 auto",
        overflow: "auto",
        ...iframeSizes[size],
      }}
    >
      <iframe
        ref={ref}
        src={canvasUrl}
        style={{
          border: "none",
          height: "100%",
          width: "100%",
        }}
      />
    </Flex>
  );
}
