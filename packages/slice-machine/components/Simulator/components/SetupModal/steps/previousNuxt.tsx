import {
  InstallSliceSimulator,
  CreatePage,
  UpdateSmJson,
  SetupStepperConfiguration,
} from "./common";
import type { DefaultStepCompProps } from "./common";

import CodeBlock from "../CodeBlock";
import { Flex, Text } from "theme-ui";
import React from "react";
import { AiOutlineFileText } from "react-icons/ai";
import {
  InstallExcerpt,
  UpdateNuxtConfExcerpt,
  CreateRouteVueExcerpt,
  UpdateSmJsonExcerpt,
} from "./excerpts";

const NuxtConfigInstructions = `// Modules: https://go.nuxtjs.dev/config-modules
  modules: [["@nuxtjs/prismic", {
    endpoint: smConfig.apiEndpoint|| ""
  }], ["nuxt-sm"]],
  
  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: ["vue-slicezone", "nuxt-sm"]
  }
  `;

const SliceSimulatorPageCreationInstruction = `<template>
    <SliceSimulator :state="state" #default="props">
      <SliceZone v-bind="props" />
    </SliceSimulator>
  </template>
  
  <script>
  import { SliceSimulator } from "@prismicio/slice-simulator-vue";
  import SliceZone from "vue-slicezone";
  
  import state from "~/.slicemachine/libraries-state.json";
  
  export default {
    components: {
      SliceSimulator,
      SliceZone
    },
    data() {
      return { state };
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
      <CodeBlock fileName="nuxt.config.js" FileIcon={AiOutlineFileText}>
        import smConfig from "./sm.json"
      </CodeBlock>
      <Text variant={"xs"} sx={{ my: 3 }}>
        Inside of the export statement, add these two properties
      </Text>
      <CodeBlock fileName="nuxt.config.js" FileIcon={AiOutlineFileText}>
        {NuxtConfigInstructions}
      </CodeBlock>
    </Flex>
  );
};
export const steps = [
  InstallSliceSimulator({
    code: `npm install --save nuxt-sm vue-slicezone @nuxtjs/prismic @prismicio/slice-simulator-vue`,
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
  excerpts: [
    InstallExcerpt,
    UpdateNuxtConfExcerpt,
    CreateRouteVueExcerpt,
    UpdateSmJsonExcerpt,
  ],
};

export default NuxtStepper;
