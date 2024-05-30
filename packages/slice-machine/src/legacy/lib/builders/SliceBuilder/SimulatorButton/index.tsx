import { Button, theme } from "@prismicio/editor-ui";
import { useRouter } from "next/router";
import React, { PropsWithChildren, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import ReactTooltip from "react-tooltip";

import { telemetry } from "@/apiClient";
import {
  HoverCard,
  HoverCardCloseButton,
  HoverCardDescription,
  HoverCardMedia,
  HoverCardTitle,
} from "@/components/HoverCard";
import { PlayCircleIcon } from "@/icons/PlayCircleIcon";
import {
  SIMULATOR_WINDOW_ID,
  VIDEO_SIMULATOR_TOOLTIP,
} from "@/legacy/lib/consts";
import { userHasSeenSimulatorToolTip } from "@/modules/userContext";
import useSliceMachineActions from "@/modules/useSliceMachineActions";
import { SliceMachineStoreType } from "@/redux/type";

const SimulatorOnboardingTooltip: React.FC<
  PropsWithChildren<{
    open: boolean;
    onClose: () => void;
  }>
> = ({ children, open, onClose }) => {
  return (
    <HoverCard open={open} trigger={children} onClose={onClose}>
      <HoverCardTitle>Simulate your slices</HoverCardTitle>
      <HoverCardMedia
        component="video"
        cloudName="dmtf1daqp"
        loop={false}
        autoPlay={false}
        publicId={VIDEO_SIMULATOR_TOOLTIP}
        poster="/simulator-video-thumbnail.png"
        controls
        onPlay={() => {
          void telemetry.track({
            event: "open-video-tutorials",
            video: VIDEO_SIMULATOR_TOOLTIP,
          });
        }}
      />
      <HoverCardDescription>
        Minimize context-switching by previewing your Slice components in the
        simulator.
      </HoverCardDescription>
      <HoverCardCloseButton>Got it</HoverCardCloseButton>
    </HoverCard>
  );
};

const SimulatorButton: React.FC<{
  disabled: boolean;
}> = ({ disabled }) => {
  const router = useRouter();

  const ref = useRef<HTMLButtonElement | null>(null);

  const { setSeenSimulatorToolTip } = useSliceMachineActions();

  const { hasSeenSimulatorTooltip } = useSelector(
    (store: SliceMachineStoreType) => ({
      hasSeenSimulatorTooltip: userHasSeenSimulatorToolTip(store),
    }),
  );

  useEffect(() => {
    const node = ref.current;
    if (node && !hasSeenSimulatorTooltip) {
      setTimeout(() => ReactTooltip.show(node), 5000);
    }
  }, [hasSeenSimulatorTooltip]);

  const onCloseToolTip = () => {
    setSeenSimulatorToolTip();
    if (ref.current) {
      const { current } = ref;
      ReactTooltip.hide(current);
    }
  };

  const shouldShowSimulatorTooltip = !hasSeenSimulatorTooltip;

  return (
    <span
      data-tip={true}
      data-tip-disable={false}
      data-for={"simulator-button-tooltip"}
      ref={ref}
    >
      <SimulatorOnboardingTooltip
        open={shouldShowSimulatorTooltip}
        onClose={onCloseToolTip}
      >
        <Button
          data-tip
          data-testid="simulator-open-button"
          onClick={() => {
            onCloseToolTip();
            window.open(`${router.asPath}/simulator`, SIMULATOR_WINDOW_ID);
          }}
          disabled={disabled}
          renderStartIcon={() => (
            <PlayCircleIcon
              color={theme.color.grey1}
              height="24px"
              style={{
                // TODO(DT-1538): our icons should have a `viewBox` of 24px.
                transform: "scale(calc(4 / 3))",
              }}
              width="24px"
            />
          )}
        >
          Simulate
        </Button>
      </SimulatorOnboardingTooltip>
    </span>
  );
};

export default SimulatorButton;
