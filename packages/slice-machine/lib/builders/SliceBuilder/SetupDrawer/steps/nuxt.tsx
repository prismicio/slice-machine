import {
  InstallSliceSimulator,
  CreatePage,
  UpdateSmJson,
  CheckSetup,
  SetupStepperConfiguration,
} from "./common";
import type { DefaultStepCompProps } from "./common";

import StepSection from "../components/StepSection";
import CodeBlock from "../components/CodeBlockWithCopy";
import { Flex, Link, Text } from "theme-ui";
import WarningSection from "@builders/SliceBuilder/SetupDrawer/components/WarningSection";
import React from "react";
import { SetupStatus } from "@src/modules/simulator/types";

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

const UpdateNuxtConfig: React.FunctionComponent<DefaultStepCompProps> = (
  props
) => {
  return (
    <StepSection
      title="Update your Nuxt config"
      status={props.setupStatus.iframe}
      {...props}
    >
      <Flex sx={{ flexDirection: "column" }}>
        {props.setupStatus.iframe === "ko" && (
          <WarningSection
            title={"We can’t connect to the simulator page"}
            sx={{ mb: 3 }}
          >
            We cannot connect to {props.simulatorUrl || "simulator URL"}. <br />{" "}
            Struggling to fix this issue? See our{" "}
            <Link target={"_blank"} href={props.linkToTroubleshootingDocs}>
              troubleshooting page
            </Link>
            .
          </WarningSection>
        )}
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
    </StepSection>
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
        <Text variant={"pre"}>_simulator.vue</Text> and add the following code.
        This page is the route you hit to simulator and develop your components.
      </>
    ),
    code: SliceSimulatorPageCreationInstruction,
  }),
  UpdateSmJson({}),
  CheckSetup({}),
];

const getStepNumberWithErrors = (setupStatus: SetupStatus) => [
  ...(setupStatus.dependencies === "ko" ? ["1"] : []),
  ...(setupStatus.iframe === "ko" ? ["2 and 3"] : []),
  ...(setupStatus.manifest === "ko" ? ["4"] : []),
];

const NuxtStepper: SetupStepperConfiguration = {
  steps,
  getStepNumberWithErrors,
};

export default NuxtStepper;
