import {
  type FC,
  useCallback,
  useRef,
  RefCallback,
  ReactNode,
  forwardRef,
  PropsWithChildren,
} from "react";
import { useSelector } from "react-redux";
import ReactTooltip from "react-tooltip";
import { Close, Flex, Paragraph } from "theme-ui";
import { ReactTooltipPortal } from "@components/ReactTooltipPortal";
import { VIDEO_YOUTUBE_PLAYLIST_LINK, PRISMIC_ACADEMY_URL } from "@lib/consts";
import { telemetry } from "@src/apiClient";
import { SideNavLink, SideNavListItem } from "@src/components/SideNav";
import { PlayCircleIcon } from "@src/icons/PlayCircleIcon";
import {
  HoverCard,
  HoverCardDescription,
  HoverCardCloseButton,
  HoverCardMedia,
  HoverCardTitle,
} from "@src/components/HoverCard";
import { useAdapterName } from "@src/hooks/useAdapterName";
import { getUserReview } from "@src/modules/userContext";
import { SliceMachineStoreType } from "@src/redux/type";

import style from "./VideoItem.module.css";

type VideoItemProps = {
  hasSeenTutorialsToolTip: boolean;
  onClose: () => void;
};

export const VideoItem = forwardRef<HTMLLIElement, VideoItemProps>(
  ({ onClose, hasSeenTutorialsToolTip }, ref) => {
    const adapterName = useAdapterName();

    const isNext = adapterName === "@slicemachine/adapter-next";
    const videoUrl = isNext ? PRISMIC_ACADEMY_URL : VIDEO_YOUTUBE_PLAYLIST_LINK;

    return (
      <MaybeVideoTooltipWrapper
        onClose={onClose}
        isNext={isNext}
        hasSeenTutorialsToolTip={hasSeenTutorialsToolTip}
      >
        <SideNavListItem ref={ref}>
          <SideNavLink
            title={isNext ? "Academy" : "Tutorial"}
            href={videoUrl}
            target="_blank"
            Icon={(props) => <PlayCircleIcon {...props} />}
            onClick={() => {
              void telemetry.track({
                event: "open-video-tutorials",
                video: videoUrl,
              });
              onClose();
            }}
          />
        </SideNavListItem>
      </MaybeVideoTooltipWrapper>
    );
  },
);

type MaybeVideoTooltipWrapperProps = VideoItemProps & {
  isNext: boolean;
  children: ReactNode;
};

const MaybeVideoTooltipWrapper: FC<MaybeVideoTooltipWrapperProps> = ({
  isNext,
  children,
  onClose,
  hasSeenTutorialsToolTip,
}) => {
  const { userReview } = useSelector((store: SliceMachineStoreType) => ({
    userReview: getUserReview(store),
  }));
  const open =
    !hasSeenTutorialsToolTip &&
    (userReview.onboarding || userReview.advancedRepository);

  if (isNext) {
    return (
      <HoverCard
        open={open}
        side="right"
        onClose={onClose}
        trigger={children}
        sideOffset={24}
        align="end"
        alignOffset={8}
      >
        <HoverCardTitle>Need help?</HoverCardTitle>
        <HoverCardMedia
          component="video"
          cloudName="dmtf1daqp"
          publicId="Tooltips/pa-course-overview_eaopsn"
          poster="/prismic-academy-101.png"
          controls
        />
        <HoverCardDescription>
          Learn how to turn a Next.js website into a page builder powered by
          Prismic.
        </HoverCardDescription>
        <HoverCardCloseButton>Got It</HoverCardCloseButton>
      </HoverCard>
    );
  }

  return (
    <OldVideoItem onClose={onClose} open={open}>
      {children}
    </OldVideoItem>
  );
};

type OldVideoItemProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
}>;

const OldVideoItem: FC<OldVideoItemProps> = ({ open, onClose, children }) => {
  const id = "video-tool-tip";
  const ref = useRef<HTMLDivElement | null>(null);

  const setRef: RefCallback<HTMLDivElement> = useCallback(
    (node) => {
      if (ref.current) {
        return;
      }
      if (node && open) {
        setTimeout(() => ReactTooltip.show(node), 5000);
        ref.current = node;
      }
    },
    [open],
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

      {open && <ToolTip id={id} onClose={onClose} />}
    </div>
  );
};

type ToolTipProps = {
  id: string;
  onClose: VideoItemProps["onClose"];
};

const ToolTip: FC<ToolTipProps> = ({ id, onClose }) => (
  <ReactTooltipPortal>
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
            Follow our Quick Start guide to learn the basics of Slice Machine
          </Paragraph>
        </Flex>
      )}
    />
  </ReactTooltipPortal>
);

export default VideoItem;
