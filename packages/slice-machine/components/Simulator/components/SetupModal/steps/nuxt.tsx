import React from "react";
import {
  InstallSliceSimulator,
  CreatePage,
  UpdateSmJson,
  SetupStepperConfiguration,
} from "./common";
import type { DefaultStepCompProps } from "./common";

import CodeBlock from "../CodeBlock";
import { Flex, Text } from "theme-ui";

const NuxtConfigInstructions = `// Modules: https://go.nuxtjs.dev/config-modules
  modules: [["@nuxtjs/prismic", {
    endpoint: smConfig.apiEndpoint|| ""
  }]],
  
  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: ["@prismicio/vue"]
  }
  `;

const SliceSimulatorPageCreationInstruction = `<template>
    <SliceSimulator v-slot="{ slices }" :state="state">
      <SliceZone :slices="slices" :components="components" />
    </SliceSimulator>
  </template>
  
  <script>
  import { SliceSimulator } from "@prismicio/slice-simulator-vue";
  import { components } from "~/slices"
  
  import state from "~/.slicemachine/libraries-state.json";
  
  export default {
    components: {
      SliceSimulator,
    },
    data() {
      return { state, components };
    }
  }
  </script>
  
  `;

const UpdateNuxtConfig: React.FunctionComponent<DefaultStepCompProps> = () => {
  return (
    <Flex sx={{ flexDirection: "column" }}>
      <Text variant={"xs"} sx={{ mb: 3 }}>
        In your <Text variant={"pre"}>nuxt.config.js</Text> file, you need to
        add at the beginning the following line:
      </Text>
      <CodeBlock>import smConfig from "./sm.json"</CodeBlock>
      <Text variant={"xs"} sx={{ my: 3 }}>
        Inside of the export statement, add these two properties
      </Text>
      <CodeBlock>{NuxtConfigInstructions}</CodeBlock>
    </Flex>
  );
};
export const steps = [
  InstallSliceSimulator({
    code: `npm install --save @nuxtjs/prismic @prismicio/slice-simulator-vue`,
  }),
  UpdateNuxtConfig,
  CreatePage({
    instructions: (
      <>
        In your "pages" directory, create a file called{" "}
        <Text variant={"pre"}>slice-simulator.vue</Text> and add the following
        code. This page is the route you hit to simulator and develop your
        components.
      </>
    ),
    code: SliceSimulatorPageCreationInstruction,
  }),
  UpdateSmJson({}),
];

const NuxtStepper: SetupStepperConfiguration = {
  steps,
};

export default NuxtStepper;
