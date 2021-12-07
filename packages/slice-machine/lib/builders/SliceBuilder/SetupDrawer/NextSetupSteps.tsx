import React from "react";

import { Flex, Text } from "theme-ui";

import StepSection from "./components/StepSection";
import hljs from "highlight.js";

const CodeBlock: React.FC<{ children: string }> = ({ children }) => {
  const text = hljs.highlightAuto(children, [
    "javascript",
    "bash",
    "xml",
    "html",
    "json",
  ]).value;
  return (
    <Flex as="pre">
      <code
        className="hljs"
        style={{ overflowX: "auto", padding: "16px 0" }}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </Flex>
  );
};

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
        <Text sx={{ color: (t) => t.colors?.textClear, mb: 2 }}>
          Slice Canvas is used to develop your components with mock data, run
          the following command to install it with npm
        </Text>
        <Flex>
          <pre style={{ overflowX: "auto", padding: "16px 0" }}>
            npm install --save nuxt-sm vue-slicezone @nuxtjs/prismic
            @prismicio/slice-canvas-renderer-vue
          </pre>
        </Flex>
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

const SliceCanvasPageCreationInstruction =
  'import { SliceCanvasRenderer } from "@prismicio/slice-canvas-renderer-react";\n' +
  'import SliceZone from "next-slicezone";\n' +
  "\n" +
  'import state from "../.slicemachine/libraries-state.json";\n' +
  "\n" +
  'import * as Slices from "../slices";\n' +
  "const resolver = ({ sliceName }) => Slices[sliceName];\n" +
  "\n" +
  "const SliceCanvas = () => (<SliceCanvasRenderer\n" +
  "\t// The `sliceZone` prop should be a function receiving slices and rendering them using your `SliceZone` component.\n" +
  "\tsliceZone={(slices) => <SliceZone slices={slices} resolver={resolver} />}\n" +
  "\tstate={state}\n" +
  "/>);\n" +
  "\n" +
  "export default SliceCanvas;";

export default NextSetupSteps;
