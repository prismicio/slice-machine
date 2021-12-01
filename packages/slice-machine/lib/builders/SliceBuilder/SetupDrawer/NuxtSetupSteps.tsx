import React from "react";

import { Flex, Text } from "theme-ui";

import StepSection from "./components/StepSection";

type NuxtSetupStepProps = {
  activeStep: number;
  onOpenStep: (stepNumber: number) => () => void;
};

const NuxtSetupSteps: React.FunctionComponent<NuxtSetupStepProps> = ({
  onOpenStep,
  activeStep,
}) => (
  <>
    <StepSection
      stepNumber={1}
      title={"Install Slice Canvas"}
      isOpen={activeStep === 1}
      onOpenStep={onOpenStep(1)}
    >
      <Flex>
        <Text sx={{ color: (t) => t.colors?.textClear }}>
          Slice Canvas is used to develop your components with mock data, run
          the following command to install it with npm
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
          In your “pages” directory, create a file called _canvas.jsx and add
          the following code. This page is the route you hit to preview and
          develop your components.
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
          property <Text variant={"pre"}>localSliceCanvasURL</Text> in the shape
          of <Text variant={"pre"}>http://localhost:PORT/PATH</Text>.
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
          After you’ve done the previous steps, we need to check that everything
          works in order.
        </Text>
      </Flex>
    </StepSection>
  </>
);

export default NuxtSetupSteps;
