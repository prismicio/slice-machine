import {
  type FC,
  forwardRef,
  PropsWithChildren,
  ReactNode,
  RefCallback,
  useCallback,
  useRef,
} from "react";
import { useSelector } from "react-redux";
import ReactTooltip from "react-tooltip";
import { Close, Flex, Paragraph } from "theme-ui";

import { telemetry } from "@/apiClient";
import {
  HoverCard,
  HoverCardCloseButton,
  HoverCardDescription,
  HoverCardMedia,
  HoverCardTitle,
} from "@/components/HoverCard";
import { SideNavLink, SideNavListItem } from "@/components/SideNav";
import { useMarketingContent } from "@/hooks/useMarketingContent";
import { PlayCircleIcon } from "@/icons/PlayCircleIcon";
import { ReactTooltipPortal } from "@/legacy/components/ReactTooltipPortal";
import { getUserReview } from "@/modules/userContext";
import { SliceMachineStoreType } from "@/redux/type";

import style from "./VideoItem.module.css";

type VideoItemProps = {
  hasSeenTutorialsToolTip: boolean;
  onClose: () => void;
};

export const VideoItem = forwardRef<HTMLLIElement, VideoItemProps>(
  ({ onClose, hasSeenTutorialsToolTip }, ref) => {
    const { tutorial } = useMarketingContent();

    return (
      <MaybeVideoTooltipWrapper
        onClose={onClose}
        hasSeenTutorialsToolTip={hasSeenTutorialsToolTip}
      >
        <SideNavListItem ref={ref}>
          <SideNavLink
            title={tutorial.link.title}
            href={tutorial.link.url}
            target="_blank"
            Icon={(props) => <PlayCircleIcon {...props} />}
            onClick={() => {
              void telemetry.track({
                event: "open-video-tutorials",
                video: tutorial.link.url,
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
  children: ReactNode;
};

const MaybeVideoTooltipWrapper: FC<MaybeVideoTooltipWrapperProps> = ({
  children,
  onClose,
  hasSeenTutorialsToolTip,
}) => {
  const { tutorial } = useMarketingContent();
  const { userReview } = useSelector((store: SliceMachineStoreType) => ({
    userReview: getUserReview(store),
  }));
  const open =
    !hasSeenTutorialsToolTip &&
    (userReview.onboarding || userReview.advancedRepository);

  if (tutorial.tooltip.video !== undefined) {
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
        <HoverCardTitle>{tutorial.tooltip.title}</HoverCardTitle>
        <HoverCardMedia
          component="video"
          cloudName={tutorial.tooltip.video.cloudName}
          publicId={tutorial.tooltip.video.publicId}
          poster={tutorial.tooltip.video.poster}
          controls
        />
        <HoverCardDescription>
          {tutorial.tooltip.description}
        </HoverCardDescription>
        <HoverCardCloseButton>
          {tutorial.tooltip.closeButton}
        </HoverCardCloseButton>
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

const ToolTip: FC<ToolTipProps> = ({ id, onClose }) => {
  const { tutorial } = useMarketingContent();

  return (
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
                {tutorial.tooltip.title}
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
              {tutorial.tooltip.description}
            </Paragraph>
          </Flex>
        )}
      />
    </ReactTooltipPortal>
  );
};

export default VideoItem;
