import React from "react";

import { Flex, Text } from "theme-ui";

import StepSection from "./components/StepSection";
import CodeBlock from "components/CodeBlock";

type NextSetupStepProps = {
  activeStep: number;
  onOpenStep: (stepNumber: number) => () => void;
};

const NextSetupSteps: React.FunctionComponent<NextSetupStepProps> = ({
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
      <Flex sx={{ flexDirection: "column" }}>
        <Text sx={{ color: "textClear", mb: 2 }}>
          Slice Canvas is used to develop your components with mock data, run
          the following command to install it with npm
        </Text>
        <CodeBlock>
          npm install --save next-slicezone prismic-reactjs
          @prismicio/slice-canvas-renderer-react
        </CodeBlock>
      </Flex>
    </StepSection>
    <StepSection
      stepNumber={2}
      title={"Create a page for Slice Canvas"}
      isOpen={activeStep === 2}
      onOpenStep={onOpenStep(2)}
    >
      <Flex sx={{ flexDirection: "column" }}>
        <Text sx={{ color: "textClear", mb: 2 }}>
          In your “pages” directory, create a file called _canvas.jsx and add
          the following code. This page is the route you hit to preview and
          develop your components.
        </Text>
        <CodeBlock>{SliceCanvasPageCreationInstruction}</CodeBlock>
      </Flex>
    </StepSection>
    <StepSection
      stepNumber={3}
      title={"Update sm.json"}
      isOpen={activeStep === 3}
      onOpenStep={onOpenStep(3)}
    >
      <Flex sx={{ flexDirection: "column" }}>
        <Text sx={{ color: "textClear", mb: 2 }}>
          Update your <Text variant={"pre"}>sm.json</Text> file with the
          property <Text variant={"pre"}>localSliceCanvasURL</Text> in the shape
          of <Text variant={"pre"}>http://localhost:PORT/PATH</Text>.
        </Text>
        <CodeBlock>
          {"// eg:\n" +
            '"localSliceCanvasURL": "http://localhost:3000/_canvas"'}
        </CodeBlock>
      </Flex>
    </StepSection>
    <StepSection
      stepNumber={4}
      title={"Check configuration"}
      isOpen={activeStep === 4}
      onOpenStep={onOpenStep(4)}
    >
      <Flex>
        <Text sx={{ color: "textClear" }}>
          After you’ve done the previous steps, we need to check that everything
          works in order.
        </Text>
      </Flex>
    </StepSection>
  </>
);

const SliceCanvasPageCreationInstruction = `import { SliceCanvasRenderer } from "@prismicio/slice-canvas-renderer-react";
import SliceZone from "next-slicezone";

import state from "../.slicemachine/libraries-state.json";

import * as Slices from "../slices";
const resolver = ({ sliceName }) => Slices[sliceName];

const SliceCanvas = () => (<SliceCanvasRenderer
\t// The \`sliceZone\` prop should be a function receiving slices and rendering them using your \`SliceZone\` component.
\tsliceZone={(props) => <SliceZone {...props} resolver={resolver} />}
\tstate={state}
/>);

export default SliceCanvas;`;

export default NextSetupSteps;
