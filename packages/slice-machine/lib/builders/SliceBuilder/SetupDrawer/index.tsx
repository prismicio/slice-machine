import React, { useState } from "react";

import Drawer from "rc-drawer";
import { Close, Flex, Link, Text } from "theme-ui";
import { FaRegQuestionCircle } from "react-icons/fa";

import StepSection from "./components/StepSection";

type SetupDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SetupDrawer: React.FunctionComponent<SetupDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const onOpenStep = (stepNumber: number) => () => {
    if (stepNumber === activeStep) {
      setActiveStep(0);
      return;
    }

    setActiveStep(stepNumber);
  };

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
          <Text sx={{ fontSize: 3 }}>Setup Slice Canvas</Text>
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
            <StepSection
              stepNumber={1}
              title={"Install Slice Canvas"}
              isOpen={activeStep === 1}
              onOpenStep={onOpenStep(1)}
            >
              <Flex>
                <Text sx={{ color: (t) => t.colors?.textClear }}>
                  Slice Canvas is used to develop your components with mock
                  data, run the following command to install it with npm
                </Text>
              </Flex>
            </StepSection>
            <StepSection
              stepNumber={2}
              title={"Create a page for Slice Canvas"}
              isOpen={activeStep === 2}
              onOpenStep={onOpenStep(2)}
            >
              <Flex>
                <Text sx={{ color: (t) => t.colors?.textClear }}>
                  In your “pages” directory, create a file called _canvas.jsx
                  and add the following code. This page is the route you hit to
                  preview and develop your components.
                </Text>
              </Flex>
            </StepSection>
            <StepSection
              stepNumber={3}
              title={"Update sm.json"}
              isOpen={activeStep === 3}
              onOpenStep={onOpenStep(3)}
            >
              <Flex>
                <Text sx={{ color: (t) => t.colors?.textClear }}>
                  Update your <Text variant={"pre"}>sm.json</Text> file with the
                  property <Text variant={"pre"}>localSliceCanvasURL</Text> in
                  the shape of{" "}
                  <Text variant={"pre"}>http://localhost:PORT/PATH</Text>.
                </Text>
              </Flex>
            </StepSection>
            <StepSection
              stepNumber={4}
              title={"Check configuration"}
              isOpen={activeStep === 4}
              onOpenStep={onOpenStep(4)}
            >
              <Flex>
                <Text sx={{ color: (t) => t.colors?.textClear }}>
                  After you’ve done the previous steps, we need to check that
                  everything works in order.
                </Text>
              </Flex>
            </StepSection>
          </Flex>
        </Flex>
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
                <FaRegQuestionCircle size={20} color={"#667587"} />
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
      </Flex>
    </Drawer>
  );
};

export default SetupDrawer;
