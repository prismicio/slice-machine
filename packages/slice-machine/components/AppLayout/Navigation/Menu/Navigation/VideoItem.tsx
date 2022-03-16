import React from "react";
import ReactTooltip from "react-tooltip";
import Item from "@components/AppLayout/Navigation/Menu/Navigation/Item";
import { MdPlayCircleFilled } from "react-icons/md";
import { Close, Flex, Paragraph } from "theme-ui";
import style from "./VideoItem.module.css";
import Tracker from "@src/tracker";
import { Frameworks } from "@slicemachine/core/build/src/models";

type VideoItemProps = {
  hasSeenTutorialsTooTip: boolean;
  onClose: () => void;
  framework: Frameworks;
  sliceMachineVersion: string;
};

const VideoItem: React.FC<VideoItemProps> = ({
  sliceMachineVersion,
  framework,
  hasSeenTutorialsTooTip,
  onClose,
}) => {
  const ref = React.createRef<HTMLParagraphElement>();
  const id = "video-tool-tip";

  const handleClose = () => {
    void Tracker.get().trackClickOnVideoTutorials(
      framework,
      sliceMachineVersion
    );
    onClose();
  };

  React.useEffect(() => {
    if (!hasSeenTutorialsTooTip && ref.current) {
      const currentRef = ref.current;
      setTimeout(() => ReactTooltip.show(currentRef), 5000);
    }
  }, []);

  return (
    <>
      <Item
        ref={ref}
        data-for={id}
        data-tip=""
        data-testid="video-toolbar"
        link={{
          title: "Video tutorials",
          Icon: MdPlayCircleFilled,
          href: "https://youtube.com/playlist?list=PLUVZjQltoA3wnaQudcqQ3qdZNZ6hyfyhH",
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
