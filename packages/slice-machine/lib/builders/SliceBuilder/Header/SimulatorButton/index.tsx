import React, { RefCallback, useCallback, useRef } from "react";
import { Box, Flex, Close, Text, Link, useThemeUI } from "theme-ui";
import { Button } from "@components/Button";

import { BsPlayCircle } from "react-icons/bs";
import { SIMULATOR_WINDOW_ID, VIDEO_SIMULATOR_TOOLTIP } from "@lib/consts";
import { useRouter } from "next/router";
import ReactTooltip from "react-tooltip";
import { Frameworks } from "@slicemachine/core/build/models";

import style from "./style.module.css";
import { userHasSeenSimulatorToolTip } from "@src/modules/userContext";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import {
  getCurrentVersion,
  getLinkToStorybookDocs,
} from "@src/modules/environment";
import Tracker from "@src/tracking/client";
import Video from "@components/CloudVideo";

const SimulatorNotSupportedTooltip: React.FC<{
  framework: Frameworks;
  linkToStorybookDocs: string;
}> = ({ framework, linkToStorybookDocs }) => (
  <ReactTooltip
    clickable
    place="bottom"
    effect="solid"
    delayHide={500}
    id="simulator-button-tooltip"
  >
    <Text as="b">Framework "{framework}" not supported</Text>
    <Text as="p">
      Slice Simulator does not support your framework yet.
      <br />
      You can{" "}
      <Link sx={{ color: "#FFF" }} target="_blank" href={linkToStorybookDocs}>
        install Storybook
      </Link>{" "}
      instead.
    </Text>
  </ReactTooltip>
);

const SimulatorOnboardingTooltip: React.FC<{
  framework: Frameworks;
  onCloseToolTip: () => void;
  version: string;
}> = ({ framework, onCloseToolTip, version }) => {
  const { theme } = useThemeUI();
  return (
    <ReactTooltip
      clickable
      border={false}
      place="bottom"
      effect="solid"
      id="simulator-button-tooltip"
      className={style.tooltip}
      arrowColor="#5842C3"
      afterHide={onCloseToolTip}
      event="none"
      textColor={String(theme.colors?.textClear)}
    >
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
          onClick={onCloseToolTip}
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
          publicId={VIDEO_SIMULATOR_TOOLTIP}
          poster="/simulator-video-thumbnail.png"
          onPlay={() => {
            void Tracker.get().trackClickOnVideoTutorials(
              framework,
              version,
              VIDEO_SIMULATOR_TOOLTIP
            );
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
              onClick={onCloseToolTip}
            />
          </Flex>
        </Box>
      </Box>
    </ReactTooltip>
  );
};

const NeedToSaveTooltip: React.FC = () => (
  <ReactTooltip
    clickable
    place="bottom"
    effect="solid"
    delayHide={100}
    id="simulator-button-tooltip"
  >
    Save your work in order to simulate
  </ReactTooltip>
);

const SimulatorButton: React.FC<{
  framework: Frameworks;
  isSimulatorAvailableForFramework: boolean;
  isTouched: boolean;
}> = ({ framework, isSimulatorAvailableForFramework, isTouched }) => {
  const router = useRouter();

  const ref = useRef<HTMLButtonElement | null>(null);

  const { setSeenSimulatorToolTip } = useSliceMachineActions();

  const { hasSeenSimulatorTooTip, linkToStorybookDocs, version } = useSelector(
    (store: SliceMachineStoreType) => ({
      hasSeenSimulatorTooTip: userHasSeenSimulatorToolTip(store),
      linkToStorybookDocs: getLinkToStorybookDocs(store),
      version: getCurrentVersion(store),
    })
  );

  const setRef: RefCallback<HTMLButtonElement> = useCallback(
    (node) => {
      if (ref.current) {
        return;
      }
      if (node && isSimulatorAvailableForFramework && !hasSeenSimulatorTooTip) {
        setTimeout(() => ReactTooltip.show(node), 5000);
      }
      ref.current = node;
    },
    [isSimulatorAvailableForFramework, hasSeenSimulatorTooTip]
  );

  const onCloseToolTip = () => {
    setSeenSimulatorToolTip();
    if (ref.current) {
      const { current } = ref;
      ReactTooltip.hide(current);
    }
  };

  const disabled = !isSimulatorAvailableForFramework || isTouched;

  return (
    <>
      <span
        data-tip={true}
        data-tip-disable={false}
        data-for={"simulator-button-tooltip"}
        ref={setRef}
      >
        <Button
          data-tip
          Icon={BsPlayCircle}
          iconFill="#6F6E77"
          label="Simulate Slice"
          data-testid="simulator-open-button"
          onClick={() => {
            onCloseToolTip();
            window.open(`${router.asPath}/simulator`, SIMULATOR_WINDOW_ID);
          }}
          disabled={disabled}
          variant={disabled ? "disabledSecondary" : "secondary"}
        />
      </span>
      {isSimulatorAvailableForFramework ? (
        !hasSeenSimulatorTooTip ? (
          <SimulatorOnboardingTooltip
            framework={framework}
            onCloseToolTip={onCloseToolTip}
            version={version}
          />
        ) : isTouched ? (
          <NeedToSaveTooltip />
        ) : null
      ) : (
        <SimulatorNotSupportedTooltip
          framework={framework}
          linkToStorybookDocs={linkToStorybookDocs}
        />
      )}
    </>
  );
};

export default SimulatorButton;
