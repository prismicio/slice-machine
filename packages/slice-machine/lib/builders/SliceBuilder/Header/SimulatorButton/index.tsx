import { Button, tokens } from "@prismicio/editor-ui";
import React, { PropsWithChildren, useEffect, useRef } from "react";
import { Text } from "theme-ui";

import { SIMULATOR_WINDOW_ID, VIDEO_SIMULATOR_TOOLTIP } from "@lib/consts";
import { useRouter } from "next/router";
import ReactTooltip from "react-tooltip";

import { PlayCircleIcon } from "@src/icons/PlayCircleIcon";
import {
  userHasSeenSimulatorToolTip,
  userHasSeenTutorialsToolTip,
} from "@src/modules/userContext";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { telemetry } from "@src/apiClient";

import { ReactTooltipPortal } from "@components/ReactTooltipPortal";
import {
  HoverCard,
  HoverCardCloseButton,
  HoverCardDescription,
  HoverCardMedia,
  HoverCardTitle,
} from "@src/components/HoverCard";

const SimulatorNotSupportedTooltip: React.FC = () => (
  <ReactTooltipPortal>
    <ReactTooltip
      clickable
      place="bottom"
      effect="solid"
      delayHide={500}
      id="simulator-button-tooltip"
    >
      <Text as="b">Framework not supported</Text>
      <Text as="p">Slice Simulator does not support your framework yet.</Text>
    </ReactTooltip>
  </ReactTooltipPortal>
);

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
      <HoverCardCloseButton>Got It</HoverCardCloseButton>
    </HoverCard>
  );
};

const NeedToSaveTooltip: React.FC = () => (
  <ReactTooltipPortal>
    <ReactTooltip
      clickable
      place="bottom"
      effect="solid"
      delayHide={500}
      id="simulator-button-tooltip"
    >
      Save your work in order to simulate
    </ReactTooltip>
  </ReactTooltipPortal>
);

const SimulatorButton: React.FC<{
  isSimulatorAvailableForFramework: boolean;
  isTouched: boolean;
}> = ({ isSimulatorAvailableForFramework, isTouched }) => {
  const router = useRouter();

  const ref = useRef<HTMLButtonElement | null>(null);

  const { setSeenSimulatorToolTip } = useSliceMachineActions();

  const { hasSeenSimulatorTooltip, hasSeenTutorialsToolTip } = useSelector(
    (store: SliceMachineStoreType) => ({
      hasSeenSimulatorTooltip: userHasSeenSimulatorToolTip(store),
      hasSeenTutorialsToolTip: userHasSeenTutorialsToolTip(store),
    })
  );

  useEffect(() => {
    const node = ref.current;
    if (
      node &&
      isSimulatorAvailableForFramework &&
      !hasSeenSimulatorTooltip &&
      hasSeenTutorialsToolTip
    ) {
      setTimeout(() => ReactTooltip.show(node), 5000);
    }
  }, [
    isSimulatorAvailableForFramework,
    hasSeenSimulatorTooltip,
    hasSeenTutorialsToolTip,
  ]);

  const onCloseToolTip = () => {
    setSeenSimulatorToolTip();
    if (ref.current) {
      const { current } = ref;
      ReactTooltip.hide(current);
    }
  };

  const disabled = !isSimulatorAvailableForFramework || isTouched;

  const shouldShowSimulatorTooltip =
    isSimulatorAvailableForFramework &&
    !hasSeenSimulatorTooltip &&
    hasSeenTutorialsToolTip;

  const shouldShowNeedToSaveTooltip =
    isSimulatorAvailableForFramework &&
    shouldShowSimulatorTooltip === false &&
    isTouched;

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
              height={tokens.size[20]}
              style={{
                // TODO(DT-1538): our icons should have a `viewBox` of 24px.
                transform: "scale(calc(4 / 3))",
              }}
              width={tokens.size[20]}
            />
          )}
          variant="secondary"
        >
          Simulate
        </Button>
      </SimulatorOnboardingTooltip>
      {isSimulatorAvailableForFramework === false ? (
        <SimulatorNotSupportedTooltip />
      ) : shouldShowNeedToSaveTooltip ? (
        <NeedToSaveTooltip />
      ) : null}
    </span>
  );
};

export default SimulatorButton;
