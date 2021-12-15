import React from "react";

import { Flex, Text } from "theme-ui";

import StepSection from "./components/StepSection";
import CodeBlock from "./components/CodeBlockWithCopy";
import { PreviewSetupStatus } from "@builders/SliceBuilder";

type NuxtSetupStepProps = {
  activeStep: number;
  onOpenStep: (stepNumber: number) => () => void;
  previewSetupStatus: PreviewSetupStatus;
};

const NuxtSetupSteps: React.FunctionComponent<NuxtSetupStepProps> = ({
  onOpenStep,
  activeStep,
  previewSetupStatus,
}) => (
  <>
    <StepSection
      stepNumber={1}
      title={"Install Slice Canvas"}
      isOpen={activeStep === 1}
      onOpenStep={onOpenStep(1)}
      status={previewSetupStatus.dependencies}
    >
      <Flex sx={{ flexDirection: "column" }}>
        <Text sx={{ color: "textClear", mb: 2 }}>
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
      isOpen={activeStep === 2}
      onOpenStep={onOpenStep(2)}
      status={previewSetupStatus.iframe}
    >
      <Flex sx={{ flexDirection: "column" }}>
        <Text sx={{ color: "textClear", mb: 2 }}>
          In your nuxt.config.js file, you need to add at the beginning the
          following line:
        </Text>
        <CodeBlock>import smConfig from "./sm.json"</CodeBlock>
        <Text sx={{ color: "textClear", mb: 2 }}>
          In your nuxt.config.js file, you need to update your "modules" and
          "build" keys with the following:
        </Text>
        <CodeBlock>{NuxtConfigInstructions}</CodeBlock>
      </Flex>
    </StepSection>
    <StepSection
      stepNumber={3}
      title={"Create a page for Slice Canvas"}
      isOpen={activeStep === 3}
      onOpenStep={onOpenStep(3)}
      status={previewSetupStatus.iframe}
    >
      <Flex sx={{ flexDirection: "column" }}>
        <Text sx={{ color: "textClear", mb: 2 }}>
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
      isOpen={activeStep === 4}
      onOpenStep={onOpenStep(4)}
      status={previewSetupStatus.manifest}
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
      title={"Check configuration"}
      isOpen={activeStep === 5}
      onOpenStep={onOpenStep(5)}
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
