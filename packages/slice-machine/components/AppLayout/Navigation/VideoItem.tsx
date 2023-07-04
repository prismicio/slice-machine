import { type FC, useCallback, useRef, RefCallback } from "react";
import ReactTooltip from "react-tooltip";
import { Close, Flex, Paragraph, Text, Box } from "theme-ui";
import { Button } from "@components/Button";

import {
  VIDEO_YOUTUBE_PLAYLIST_LINK,
  PRISMIC_ACADEMY_URL,
  VIDEO_SIMULATOR_TOOLTIP,
} from "@lib/consts";
import { telemetry } from "@src/apiClient";
import { SideNavLink, SideNavListItem } from "@src/components/SideNav";
import { PlayCircleIcon } from "@src/icons/PlayCircle";
import { useSliceMachineConfig } from "@src/hooks/useSliceMachineConfig";
import Video from "@components/CloudVideo";
// import { ToolTip } from '@prismicio/editor-ui';

import style from "./VideoItem.module.css";

type VideoItemProps = {
  hasSeenTutorialsToolTip: boolean;
  onClose: () => void;
};

const NextVideoToolTip: FC<{
  id: string;
  onClose: VideoItemProps["onClose"];
}> = ({ id, onClose }) => (
  <ReactTooltip
    clickable
    border={false}
    place="bottom"
    effect="solid"
    id={id}
    // className={style.tooltip}
    arrowColor="#5842C3"
    afterHide={onClose}
    event="none"
    // textColor={String(theme.colors?.textClear)}
    getContent={() => (
      <>
        <Flex
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
          }}
          data-testid="simulator-tooltip"
        >
          <Text sx={{ color: "#FFF", fontSize: "12px", fontWeight: "600" }}>
            Simulate your slices
          </Text>
          <Close
            data-testid="simulator-tooltip-close-button"
            onClick={onClose}
            sx={{
              width: "26px",
              color: "#FFF",
            }}
          />
        </Flex>
        <Box sx={{ bg: "#FFF" }}>
          <Video
            loop={false}
            autoPlay={false}
            publicId={VIDEO_SIMULATOR_TOOLTIP} // TODO: update this once the video has been added to cloudinay
            poster="/simulator-video-thumbnail.png"
            onPlay={() => {
              void telemetry.track({
                event: "open-video-tutorials",
                video: VIDEO_SIMULATOR_TOOLTIP,
              });
            }}
          />
          <Box sx={{ p: "16px" }}>
            <Text sx={{ fontSize: "12px", lineHeight: "16px" }}>
              Minimize context-switching by previewing your Slice components in
              the simulator.
            </Text>

            <Flex
              sx={{
                alignItems: "center",
                justifyContent: "flex-end",
                mt: "24px",
              }}
            >
              <Button
                label="Got it"
                variant="xs"
                sx={{
                  cursor: "pointer",
                  fontFamily: "body",
                }}
                onClick={onClose}
              />
            </Flex>
          </Box>
        </Box>
      </>
    )}
  />
);

const OldToolTip: FC<{
  id: string;
  onClose: VideoItemProps["onClose"];
}> = ({ id, onClose }) => (
  <ReactTooltip
    id={id}
    effect="solid"
    backgroundColor="#5741c3"
    clickable
    className={style.videoTutorialsContainer}
    afterHide={onClose}
    offset={{
      left: 80,
    }}
    role="tooltip"
    getContent={() => (
      <Flex
        sx={{
          maxWidth: "268px",
          flexDirection: "column",
        }}
      >
        <Flex
          sx={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Paragraph sx={{ color: "#FFF", fontWeight: 700 }}>
            Need Help?
          </Paragraph>
          <Close
            data-testid="video-tooltip-close-button"
            onClick={onClose}
            sx={{
              width: "26px",
            }}
          />
        </Flex>
        <Paragraph sx={{ color: "#FFF", fontWeight: 400 }}>
          Follow our Quick Start guide to learn the basics of Slice Machine
        </Paragraph>
      </Flex>
    )}
  />
);

const ToolTipForFramework: FC<{
  id: string;
  isNext: boolean;
  onClose: VideoItemProps["onClose"];
}> = ({ id, isNext, onClose }) => {
  if (isNext) {
    return <NextVideoToolTip id={id} onClose={onClose} />;
  }
  return <OldToolTip id={id} onClose={onClose} />;
};

const VideoItem: FC<VideoItemProps> = ({
  hasSeenTutorialsToolTip,
  onClose,
}) => {
  const id = "video-tool-tip";
  // const videoUrl = VIDEO_YOUTUBE_PLAYLIST_LINK;
  const ref = useRef<HTMLDivElement | null>(null);

  const config = useSliceMachineConfig();

  const isNext =
    config !== null && config.adapter === "@slicemachine/adapter-next";
  const videoUrl = isNext ? PRISMIC_ACADEMY_URL : VIDEO_YOUTUBE_PLAYLIST_LINK;

  console.log({ isNext });

  const setRef: RefCallback<HTMLDivElement> = useCallback(
    (node) => {
      if (ref.current) {
        return;
      }
      if (node && !hasSeenTutorialsToolTip) {
        setTimeout(() => ReactTooltip.show(node), 5000);
      }
      ref.current = node;
    },
    [hasSeenTutorialsToolTip]
  );
  return (
    <div
      data-hello
      ref={setRef}
      data-for={id}
      data-tip
      data-testid="video-toolbar"
    >
      <SideNavListItem>
        <SideNavLink
          title="Tutorial"
          href={videoUrl}
          target="_blank"
          Icon={(props) => <PlayCircleIcon {...props} />}
          onClick={() => {
            void telemetry.track({
              event: "open-video-tutorials",
              video: videoUrl,
            });
            window.open(videoUrl, "_blank");
            onClose();
          }}
        />
      </SideNavListItem>

      {(!hasSeenTutorialsToolTip || true) && (
        <ToolTipForFramework isNext={isNext} id={id} onClose={onClose} />
      )}
    </div>
  );
};

export default VideoItem;
