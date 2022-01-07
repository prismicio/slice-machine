import React, { useState, useEffect, useContext } from "react";
import Drawer from "rc-drawer";
import { Close, Flex, Text } from "theme-ui";
import NextSetupSteps from "./NextSetupSteps";
import NuxtSetupSteps from "./NuxtSetupSteps";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "../../../../src/redux/type";
import {
  getFramework,
  selectIsPreviewAvailableForFramework,
  getStorybookUrl,
  getCurrentVersion,
} from "../../../../src/modules/environment";
import { Frameworks } from "@slicemachine/core/build/src/models/Framework";
import StorybookSection from "./components/StorybookSection";
import { TrackerContext } from "../../../../src/utils/tracker";

type SetupDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SetupDrawer: React.FunctionComponent<SetupDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const tracker = useContext(TrackerContext);

  const { storybook, framework, isPreviewAvailableForFramework, version } =
    useSelector((state: SliceMachineStoreType) => ({
      framework: getFramework(state),
      isPreviewAvailableForFramework:
        selectIsPreviewAvailableForFramework(state),
      storybook: getStorybookUrl(state),
      version: getCurrentVersion(state),
    }));

  const onOpenStep = (stepNumber: number) => () => {
    if (stepNumber === activeStep) {
      setActiveStep(0);
      return;
    }

    setActiveStep(stepNumber);
  };

  useEffect(() => {
    tracker?.Track.SlicePreviewSetup({ framework, version });
  }, []);

  // We close the drawer if the framework cannot handle the preview
  useEffect(() => {
    if (isPreviewAvailableForFramework) return;
    onClose();
  }, [isPreviewAvailableForFramework]);

  return (
    <Drawer
      placement="right"
      open={isOpen}
      level={null}
      onClose={onClose}
      width={492}
    >
      <Flex
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Flex
          sx={{
            p: 20,
            justifyContent: "space-between",
            borderBottomStyle: "solid",
            borderBottomWidth: "1px",
            borderBottomColor: (t) => t.colors?.borders,
          }}
        >
          <Text sx={{ fontSize: 3 }}>Setup Slice Preview</Text>
          <Close
            data-testid="close-set-up-preview"
            color={"#4E4E55"}
            onClick={onClose}
          />
        </Flex>
        <Flex
          sx={{
            flex: 1,
            overflow: "auto",
            flexDirection: "column",
            pl: 4,
            pr: 4,
          }}
        >
          <Flex as={"section"} sx={{ flexDirection: "column" }}>
            {framework === Frameworks.nuxt && (
              <NuxtSetupSteps activeStep={activeStep} onOpenStep={onOpenStep} />
            )}
            {framework === Frameworks.next && (
              <NextSetupSteps activeStep={activeStep} onOpenStep={onOpenStep} />
            )}
          </Flex>
        </Flex>
        {!storybook && <StorybookSection framework={framework} />}
      </Flex>
    </Drawer>
  );
};

export default SetupDrawer;
