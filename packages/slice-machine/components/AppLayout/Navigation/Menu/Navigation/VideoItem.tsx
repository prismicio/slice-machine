import { type FC, useCallback, useRef } from "react";
import ReactTooltip from "react-tooltip";
import Item from "@components/AppLayout/Navigation/Menu/Navigation/Item";
import { MdPlayCircleFilled } from "react-icons/md";
import { Close, Flex, Paragraph } from "theme-ui";
import style from "./VideoItem.module.css";
import Tracker from "@src/tracking/client";
import { Frameworks } from "@slicemachine/core/build/models";
import { VIDEO_YOUTUBE_PLAYLIST_LINK } from "../../../../../lib/consts";

type VideoItemProps = {
  hasSeenTutorialsTooTip: boolean;
  onClose: () => void;
  framework: Frameworks;
  sliceMachineVersion: string;
};

const VideoItem: FC<VideoItemProps> = ({
  sliceMachineVersion,
  framework,
  hasSeenTutorialsTooTip,
  onClose,
}) => {
  const id = "video-tool-tip";
  const videoUrl = VIDEO_YOUTUBE_PLAYLIST_LINK;

  const handleClose = () => {
    void Tracker.get().trackClickOnVideoTutorials(
      framework,
      sliceMachineVersion,
      videoUrl
    );
    onClose();
  };

  const timeoutIdRef = useRef<ReturnType<typeof setTimeout>>();
  const tooltipRef = useCallback(
    (target: Element | null) => {
      clearTimeout(timeoutIdRef.current);
      ReactTooltip.hide(target ?? undefined);
      if (target && !hasSeenTutorialsTooTip) {
        timeoutIdRef.current = setTimeout(() => {
          ReactTooltip.show(target);
        }, 5_000);
      }
    },
    [hasSeenTutorialsTooTip]
  );

  return (
    <>
      <Item
        ref={tooltipRef}
        data-for={id}
        data-tip=""
        data-testid="video-toolbar"
        link={{
          title: "Video tutorials",
          Icon: MdPlayCircleFilled,
          href: videoUrl,
          target: "_blank",
          match: () => false,
        }}
        theme={"emphasis"}
        onClick={handleClose}
      />
      {!hasSeenTutorialsTooTip && (
        <ReactTooltip
          id={id}
          effect="solid"
          backgroundColor="#5B3DF5"
          clickable={true}
          className={style.videoTutorialsContainer}
          afterHide={handleClose}
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
                  onClick={handleClose}
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
    </>
  );
};

export default VideoItem;
