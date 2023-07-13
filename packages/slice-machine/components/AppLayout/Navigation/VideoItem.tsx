import {
  type FC,
  useCallback,
  useRef,
  RefCallback,
  ReactNode,
  forwardRef,
} from "react";
import ReactTooltip from "react-tooltip";
import { Close, Flex, Paragraph, BaseStyles } from "theme-ui";
import { useRequest } from "@prismicio/editor-support/Suspense";

import { SliceMachineConfig } from "@slicemachine/manager";
import { VIDEO_YOUTUBE_PLAYLIST_LINK, PRISMIC_ACADEMY_URL } from "@lib/consts";
import { telemetry } from "@src/apiClient";
import { managerClient } from "@src/managerClient";
import { SideNavLink, SideNavListItem } from "@src/components/SideNav";
import { PlayCircleIcon } from "@src/icons/PlayCircle";
import { VideoPopover } from "@src/components/VideoPopover";

import style from "./VideoItem.module.css";

type VideoItemProps = {
  hasSeenTutorialsToolTip: boolean;
  onClose: () => void;
};

export const VideoItem = forwardRef<HTMLLIElement, VideoItemProps>(
  ({ onClose, hasSeenTutorialsToolTip }, ref) => {
    const config = useSliceMachineConfig();

    const isNext = config?.adapter === "@slicemachine/adapter-next";
    const videoUrl = isNext ? PRISMIC_ACADEMY_URL : VIDEO_YOUTUBE_PLAYLIST_LINK;

    return (
      <MaybeVideoTooltipWrapper
        onClose={onClose}
        isNext={isNext}
        hasSeenTutorialsToolTip={hasSeenTutorialsToolTip}
      >
        <SideNavListItem ref={ref}>
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
      </MaybeVideoTooltipWrapper>
    );
  }
);

async function getSliceMachineConfig() {
  try {
    return await managerClient.project.getSliceMachineConfig();
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

function useSliceMachineConfig(): SliceMachineConfig | undefined {
  return useRequest(getSliceMachineConfig, []);
}

const MaybeVideoTooltipWrapper: FC<
  VideoItemProps & {
    isNext: boolean;
    children: ReactNode;
  }
> = ({ isNext, children, onClose, hasSeenTutorialsToolTip }) => {
  if (isNext) {
    const videoUrl = "Tooltips/pa-course-overview_eaopsn";
    return (
      <VideoPopover
        side="right"
        sideOffset={32}
        cloudName="dmtf1daqp"
        publicId={videoUrl}
        onClose={onClose}
        // thumbnail="" TODO: get a thumbnail
        onPlay={() => {
          void telemetry.track({
            event: "open-video-tutorials",
            video: videoUrl,
          });
        }}
        open={!hasSeenTutorialsToolTip}
      >
        {children}
      </VideoPopover>
    );
  }

  return (
    <OldVideoItem
      onClose={onClose}
      hasSeenTutorialsToolTip={hasSeenTutorialsToolTip}
    >
      {children}
    </OldVideoItem>
  );
};

const OldVideoItem: FC<VideoItemProps & { children: ReactNode }> = ({
  hasSeenTutorialsToolTip,
  onClose,
  children,
}) => {
  const id = "video-tool-tip";
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
    <div
      data-hello
      ref={setRef}
      data-for={id}
      data-tip
      data-testid="video-toolbar"
    >
      {children}

      {!hasSeenTutorialsToolTip && <ToolTip id={id} onClose={onClose} />}
    </div>
  );
};

const ToolTip: FC<{
  id: string;
  onClose: VideoItemProps["onClose"];
}> = ({ id, onClose }) => (
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
      <BaseStyles>
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
      </BaseStyles>
    )}
  />
);

export default VideoItem;
