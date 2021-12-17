import React from "react";

import { Flex, Text } from "theme-ui";

import StepSection from "./components/StepSection";
import CodeBlock from "./components/CodeBlockWithCopy";
import WarningSection from "@builders/SliceBuilder/SetupDrawer/components/WarningSection";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  selectOpenedStep,
  selectSetupStatus,
  selectUserHasAtLeastOneStepMissing,
  selectUserHasConfiguredAllSteps,
} from "@src/modules/preview";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import SliceMachineButton from "@components/SliceMachineButton";
import SuccessSection from "./components/SuccessSection";

const NuxtSetupSteps: React.FunctionComponent = () => {
  const { toggleSetupDrawerStep, checkPreviewSetup } = useSliceMachineActions();

  const {
    openedStep,
    setupStatus,
    userHasAtLeastOneStepMissing,
    userHasConfiguredAllSteps,
    isCheckingSetup,
  } = useSelector((state: SliceMachineStoreType) => ({
    openedStep: selectOpenedStep(state),
    setupStatus: selectSetupStatus(state),
    isCheckingSetup: isLoading(state, LoadingKeysEnum.CHECK_PREVIEW),
    userHasAtLeastOneStepMissing: selectUserHasAtLeastOneStepMissing(state),
    userHasConfiguredAllSteps: selectUserHasConfiguredAllSteps(state),
  }));

  const StepNumberWithErrors = [
    ...(setupStatus.dependencies === "ko" ? ["1"] : []),
    ...(setupStatus.iframe === "ko" ? ["2 and 3"] : []),
    ...(setupStatus.manifest === "ko" ? ["4"] : []),
  ];

  return (
    <>
      <StepSection
        stepNumber={1}
        title={"Install Slice Canvas"}
        isOpen={openedStep === 1}
        onOpenStep={() => toggleSetupDrawerStep(1)}
        status={setupStatus.dependencies}
      >
        <Flex sx={{ flexDirection: "column" }}>
          {setupStatus.dependencies === "ko" && (
            <WarningSection
              title={"Some dependencies are missing"}
              sx={{ mb: 3 }}
            />
          )}
          <Text sx={{ color: "textClear", mb: 3 }}>
            Slice Canvas is used to develop your components with mock data, run
            the following command to install it with npm
          </Text>
          <CodeBlock>
            npm install --save nuxt-sm vue-slicezone @nuxtjs/prismic
            @prismicio/slice-canvas-renderer-vue
          </CodeBlock>
        </Flex>
      </StepSection>
      <StepSection
        stepNumber={2}
        title={"Update your Nuxt config"}
        isOpen={openedStep === 2}
        onOpenStep={() => toggleSetupDrawerStep(2)}
        status={setupStatus.iframe}
      >
        <Flex sx={{ flexDirection: "column" }}>
          <Text sx={{ color: "textClear", mb: 3 }}>
            In your nuxt.config.js file, you need to add at the beginning the
            following line:
          </Text>
          <CodeBlock>import smConfig from "./sm.json"</CodeBlock>
          <Text sx={{ color: "textClear", my: 3 }}>
            In your nuxt.config.js file, you need to update your "modules" and
            "build" keys with the following:
          </Text>
          <CodeBlock>{NuxtConfigInstructions}</CodeBlock>
        </Flex>
      </StepSection>
      <StepSection
        stepNumber={3}
        title={"Create a page for Slice Canvas"}
        isOpen={openedStep === 3}
        onOpenStep={() => toggleSetupDrawerStep(3)}
        status={setupStatus.iframe}
      >
        <Flex sx={{ flexDirection: "column" }}>
          <Text sx={{ color: "textClear", mb: 3 }}>
            In your “pages” directory, create a file called _canvas.vue and add
            the following code. This page is the route you hit to preview and
            develop your components.
          </Text>
          <CodeBlock>{SliceCanvasPageCreationInstruction}</CodeBlock>
        </Flex>
      </StepSection>
      <StepSection
        stepNumber={4}
        title={"Update sm.json"}
        isOpen={openedStep === 4}
        onOpenStep={() => toggleSetupDrawerStep(4)}
        status={setupStatus.manifest}
      >
        <Flex sx={{ flexDirection: "column" }}>
          {setupStatus.manifest === "ko" && (
            <WarningSection
              title={"Some dependencies are missing"}
              sx={{ mb: 2 }}
            >
              Looks like we can’t find the “localSliceCanvasURL“ property in
              your sm.json file.
            </WarningSection>
          )}
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
        isOpen={openedStep === 5}
        onOpenStep={() => toggleSetupDrawerStep(5)}
      >
        <Flex sx={{ flexDirection: "column", mx: -24 }}>
          <Text sx={{ color: "textClear", mb: 3 }}>
            After you’ve done the previous steps, we need to check that
            everything works in order.
          </Text>
          {userHasAtLeastOneStepMissing && (
            <WarningSection
              title={"We are running into some issues"}
              sx={{ mb: 3 }}
            >
              We ran into some issues while checking your configuration of Slice
              Preview. Please check step {StepNumberWithErrors.join(" and ")}{" "}
              for more information.
            </WarningSection>
          )}
          {userHasConfiguredAllSteps ? (
            <SuccessSection />
          ) : (
            <SliceMachineButton
              sx={{
                minWidth: 155,
              }}
              isLoading={isCheckingSetup}
              onClick={() => checkPreviewSetup(false)}
            >
              Check configuration
            </SliceMachineButton>
          )}
        </Flex>
      </StepSection>
    </>
  );
};

const SliceCanvasPageCreationInstruction = `<template>
  <SliceCanvasRenderer :state="state" #default="props">
    <SliceZone v-bind="props" />
  </SliceCanvasRenderer>
</template>

<script>
import { SliceCanvasRenderer } from "@prismicio/slice-canvas-renderer-vue";
import SliceZone from "vue-slicezone";

import state from "~/.slicemachine/libraries-state.json";

export default {
  components: {
    SliceCanvasRenderer,
    SliceZone
  },
  data() {
    return { state };
  }
}
</script>
`;

const NuxtConfigInstructions = `// Modules: https://go.nuxtjs.dev/config-modules
modules: [["@nuxtjs/prismic", {
  endpoint: smConfig.apiEndpoint|| ""
}], ["nuxt-sm"]],

// Build Configuration: https://go.nuxtjs.dev/config-build
build: {
  transpile: ["vue-slicezone", "nuxt-sm"]
}
`;

export default NuxtSetupSteps;
