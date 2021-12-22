import {
  InstallSliceCanvas,
  CreatePage,
  UpdateSmJson,
  CheckSetup,
} from "./common";
import type { DefaultStepCompProps } from "./common";

import StepSection from "../components/StepSection";
import CodeBlock from "../components/CodeBlockWithCopy";
import { Flex, Text } from "theme-ui";

const NuxtConfigInstructions = `// Modules: https://go.nuxtjs.dev/config-modules
modules: [["@nuxtjs/prismic", {
  endpoint: smConfig.apiEndpoint|| ""
}], ["nuxt-sm"]],

// Build Configuration: https://go.nuxtjs.dev/config-build
build: {
  transpile: ["vue-slicezone", "nuxt-sm"]
}
`;

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

const UpdateNuxtConfig = (props: DefaultStepCompProps): React.ReactElement => {
  return (
    <StepSection title="Update your Nuxt config" {...props}>
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
  );
};
export const steps = [
  InstallSliceCanvas({
    code: `npm install --save nuxt-sm vue-slicezone @nuxtjs/prismic @prismicio/slice-canvas-renderer-vue`,
  }),
  UpdateNuxtConfig,
  CreatePage({
    instructions: `In your "pages" directory, create a file called _canvas.vue and add
the following code. This page is the route you hit to preview and
develop your components.`,
    code: SliceCanvasPageCreationInstruction,
  }),
  UpdateSmJson({}),
  CheckSetup({}),
];
