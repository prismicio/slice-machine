import React, { useState, useEffect } from "react";

import Drawer from "rc-drawer";
import { Close, Flex, Link, Text } from "theme-ui";
import { FaRegQuestionCircle } from "react-icons/fa";

import NextSetupSteps from "./NextSetupSteps";
import NuxtSetupSteps from "./NuxtSetupSteps";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  getFramework,
  selectIsPreviewAvailableForFramework,
} from "@src/modules/environment";
import { Frameworks } from "@slicemachine/core/build/src/models/Framework";
import { PreviewSetupStatus } from "@builders/SliceBuilder";

type SetupDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  previewSetupStatus: PreviewSetupStatus;
};

const SetupDrawer: React.FunctionComponent<SetupDrawerProps> = ({
  isOpen,
  onClose,
  previewSetupStatus,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const { framework, isPreviewAvailableForFramework } = useSelector(
    (state: SliceMachineStoreType) => ({
      framework: getFramework(state),
      isPreviewAvailableForFramework:
        selectIsPreviewAvailableForFramework(state),
    })
  );

  const onOpenStep = (stepNumber: number) => () => {
    if (stepNumber === activeStep) {
      setActiveStep(0);
      return;
    }

    setActiveStep(stepNumber);
  };

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
            borderBottom: (t) => `1px solid ${t.colors?.borders}`,
          }}
        >
          <Text sx={{ fontSize: 3 }}>Setup Slice Preview</Text>
          <Close color={"#4E4E55"} onClick={onClose} />
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
              <NuxtSetupSteps
                activeStep={activeStep}
                onOpenStep={onOpenStep}
                previewSetupStatus={previewSetupStatus}
              />
            )}
            {framework === Frameworks.next && (
              <NextSetupSteps
                activeStep={activeStep}
                onOpenStep={onOpenStep}
                previewSetupStatus={previewSetupStatus}
              />
            )}
          </Flex>
        </Flex>
        <HelpSection />
      </Flex>
    </Drawer>
  );
};

const HelpSection = () => (
  <Flex
    sx={{
      padding: "16px 20px",
    }}
  >
    <Flex
      sx={{
        padding: 3,
        backgroundColor: (t) => `${t.colors?.gray}`,
        borderRadius: 8,
        flexDirection: "column",
      }}
    >
      <Flex
        sx={{
          alignItems: "center",
          mb: 3,
        }}
      >
        <Flex
          sx={{
            mr: 2,
          }}
        >
          <FaRegQuestionCircle size={20} color="textGray" />
        </Flex>
        <Text sx={{ fontSize: 2, fontWeight: 500 }}>Help Section</Text>
      </Flex>
      <Text sx={{ color: (t) => t.colors?.textClear }}>
        Are you having difficulties setting up the preview? You can check{" "}
        <Link target={"_blank"} href={"https://prismic.io"}>
          the documentation
        </Link>{" "}
        for more info to set it up correctly.
      </Text>
    </Flex>
  </Flex>
);

export default SetupDrawer;
