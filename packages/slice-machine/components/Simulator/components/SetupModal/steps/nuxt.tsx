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
import { AiOutlineFileText } from "react-icons/ai";
import {
  CreateRouteVueExcerpt,
  InstallExcerpt,
  UpdateNuxtConfExcerpt,
  UpdateSmJsonExcerpt,
} from "./excerpts";

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

export default {
  components: {
    SliceSimulator,
  },
  data() {
    return { state: {}, components };
  }
}
</script>

  `;

const UpdateNuxtConfig: React.FunctionComponent<DefaultStepCompProps> = () => {
  return (
    <Flex sx={{ flexDirection: "column", height: "calc(100% - 48px)" }}>
      <Text variant={"xs"} sx={{ mb: 3 }}>
        In your <Text variant={"pre"}>nuxt.config.js</Text> file, you need to
        add at the beginning the following line:
      </Text>
      <CodeBlock
        fileName="nuxt.config.js"
        FileIcon={AiOutlineFileText}
        code={{
          text: 'import smConfig from "./sm.json";',
          version: "js",
        }}
      />
      <Text variant={"xs"} sx={{ my: 3 }}>
        Inside of the export statement, add these two properties:
      </Text>
      <CodeBlock
        fileName="nuxt.config.js"
        FileIcon={AiOutlineFileText}
        fullHeightCode
        code={{
          text: NuxtConfigInstructions,
          version: "js",
        }}
      />
    </Flex>
  );
};
export const steps = [
  InstallSliceSimulator({
    npm: `npm install --save @nuxtjs/prismic @prismicio/slice-simulator-vue`,
    yarn: `yarn add @nuxtjs/prismic @prismicio/slice-simulator-vue`,
  }),
  UpdateNuxtConfig,
  CreatePage({
    code: SliceSimulatorPageCreationInstruction,
    fileName: "slice-simulator.vue",
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
