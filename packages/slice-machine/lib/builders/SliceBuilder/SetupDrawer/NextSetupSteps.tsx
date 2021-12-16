import React from "react";

import { Button, Flex, Text } from "theme-ui";

import StepSection from "./components/StepSection";
import CodeBlock from "./components/CodeBlockWithCopy";
import { PreviewSetupStatus } from "@builders/SliceBuilder";
import WarningSection from "@builders/SliceBuilder/SetupDrawer/components/WarningSection";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { selectOpenedStep } from "@src/modules/preview";

type NextSetupStepProps = {
  previewSetupStatus: PreviewSetupStatus;
};

const NextSetupSteps: React.FunctionComponent<NextSetupStepProps> = ({
  previewSetupStatus,
}) => {
  const { toggleSetupDrawerStep } = useSliceMachineActions();
  const { openedStep } = useSelector((state: SliceMachineStoreType) => ({
    openedStep: selectOpenedStep(state),
  }));

  const userHasAtLeastOneError =
    previewSetupStatus.dependencies !== "ok" ||
    previewSetupStatus.iframe !== "ok" ||
    previewSetupStatus.manifest !== "ok";

  return (
    <>
      <StepSection
        stepNumber={1}
        title={"Install Slice Canvas"}
        isOpen={openedStep === 1}
        onOpenStep={() => toggleSetupDrawerStep(1)}
        status={previewSetupStatus.dependencies}
      >
        <Flex sx={{ flexDirection: "column" }}>
          {previewSetupStatus.dependencies === "ko" && (
            <WarningSection
              title={"Some dependencies are missing"}
              sx={{ mb: 2 }}
            />
          )}
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
        isOpen={openedStep === 2}
        onOpenStep={() => toggleSetupDrawerStep(2)}
        status={previewSetupStatus.iframe}
      >
        <Flex sx={{ flexDirection: "column" }}>
          {previewSetupStatus.iframe === "ko" && (
            <WarningSection
              title={"We can’t connect to the preview page"}
              sx={{ mb: 3 }}
            >
              We cannot connect to “localhost:3000/_canvas“ and found the slice
              preview page. Learn more
            </WarningSection>
          )}
          <Text sx={{ color: "textClear", mb: 3 }}>
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
        isOpen={openedStep === 3}
        onOpenStep={() => toggleSetupDrawerStep(3)}
        status={previewSetupStatus.manifest}
      >
        {previewSetupStatus.manifest === "ko" && (
          <WarningSection
            title={"We can’t connect to the preview page"}
            sx={{ mb: 3 }}
          >
            Looks like we can’t find the “localSliceCanvasURL“ property in your
            sm.json file.
          </WarningSection>
        )}
        <Flex sx={{ flexDirection: "column" }}>
          <Text sx={{ color: "textClear", mb: 3 }}>
            Update your <Text variant={"pre"}>sm.json</Text> file with the
            property <Text variant={"pre"}>localSliceCanvasURL</Text> in the
            shape of <Text variant={"pre"}>http://localhost:PORT/PATH</Text>.
          </Text>
          <CodeBlock>
            {"// eg:\n" +
              '"localSliceCanvasURL": "http://localhost:3000/_canvas"'}
          </CodeBlock>
        </Flex>
      </StepSection>
      <StepSection
        title={"Check configuration"}
        isOpen={openedStep === 4}
        onOpenStep={() => toggleSetupDrawerStep(4)}
      >
        <Flex sx={{ flexDirection: "column", mx: -24 }}>
          <Text sx={{ color: "textClear", mb: 3 }}>
            After you’ve done the previous steps, we need to check that
            everything works in order.
          </Text>
          {userHasAtLeastOneError && (
            <WarningSection
              title={"We are running into some errors"}
              sx={{ mb: 3 }}
            >
              We ran into some issues while checking your configuration of Slice
              Preview. Please check step 3 and 4 for more information.
            </WarningSection>
          )}
          <Button
            sx={{
              alignSelf: "flex-start",
            }}
          >
            Check configuration
          </Button>
        </Flex>
      </StepSection>
    </>
  );
};

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
