import { type FC, useCallback, useRef, RefCallback } from "react";
import ReactTooltip from "react-tooltip";
import { Close, Flex, Paragraph } from "theme-ui";

import { VIDEO_YOUTUBE_PLAYLIST_LINK } from "@lib/consts";
import { telemetry } from "@src/apiClient";
import { SideNavLink, SideNavListItem } from "@src/components/SideNav";
import { PlayCircleIcon } from "@src/icons/PlayCircle";

import style from "./VideoItem.module.css";

type VideoItemProps = {
  hasSeenTutorialsToolTip: boolean;
  onClose: () => void;
};

const VideoItem: FC<VideoItemProps> = ({
  hasSeenTutorialsToolTip,
  onClose,
}) => {
  const id = "video-tool-tip";
  const videoUrl = VIDEO_YOUTUBE_PLAYLIST_LINK;
  const ref = useRef<HTMLDivElement | null>(null);

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
    <div ref={setRef}>
      <SideNavListItem data-for={id} data-tip="" data-testid="video-toolbar">
        <SideNavLink
          title="Tutorial"
          href={VIDEO_YOUTUBE_PLAYLIST_LINK}
          target="_blank"
          Icon={(props) => <PlayCircleIcon {...props} />}
          onClick={() => {
            void telemetry.track({
              event: "open-video-tutorials",
              video: videoUrl,
            });
            window.open(VIDEO_YOUTUBE_PLAYLIST_LINK, "_blank");
            onClose();
          }}
        />
      </SideNavListItem>

      {!hasSeenTutorialsToolTip && (
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
              data-testid="video-tooltip"
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
                Follow our Quick Start guide to learn the basics of Slice
                Machine
              </Paragraph>
            </Flex>
          )}
        />
      )}
    </div>
  );
};

export default VideoItem;
