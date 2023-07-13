import { type FC, useCallback, useRef, RefCallback } from "react";
import ReactTooltip from "react-tooltip";
import { Close, Flex, Paragraph } from "theme-ui";

import { VIDEO_YOUTUBE_PLAYLIST_LINK, PRISMIC_ACADEMY_URL } from "@lib/consts";
import { telemetry } from "@src/apiClient";
import { SideNavLink, SideNavListItem } from "@src/components/SideNav";
import { PlayCircleIcon } from "@src/icons/PlayCircle";

import style from "./VideoItem.module.css";
import { useSliceMachineConfig } from "@src/hooks/useSliceMachineConfig";

type VideoItemProps = {
  hasSeenTutorialsToolTip: boolean;
  onClose: () => void;
};

const ToolTip: FC<{
  id: string;
  onClose: VideoItemProps["onClose"];
  isNext: boolean;
}> = ({ id, onClose, isNext }) => (
  <ReactTooltip
    id={id}
    effect="solid"
    place="right"
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
          {isNext
            ? "Learn how to turn a Next.js website into a page builder powered by Prismic."
            : "Follow our Quick Start guide to learn the basics of Slice Machine"}
        </Paragraph>
      </Flex>
    )}
  />
);

const VideoItem: FC<VideoItemProps> = ({
  hasSeenTutorialsToolTip,
  onClose,
}) => {
  const id = "video-tool-tip";
  const ref = useRef<HTMLDivElement | null>(null);

  const config = useSliceMachineConfig();

  const isNext = config?.adapter === "@slicemachine/adapter-next";
  const videoUrl = isNext ? PRISMIC_ACADEMY_URL : VIDEO_YOUTUBE_PLAYLIST_LINK;

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

      {!hasSeenTutorialsToolTip && (
        <ToolTip isNext={isNext} id={id} onClose={onClose} />
      )}
    </div>
  );
};

export default VideoItem;
