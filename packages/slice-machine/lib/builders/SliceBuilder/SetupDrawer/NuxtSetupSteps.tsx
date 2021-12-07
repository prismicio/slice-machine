import React from "react";

import { Flex, Text } from "theme-ui";

import StepSection from "./components/StepSection";

type NuxtSetupStepProps = {
  activeStep: number;
  onOpenStep: (stepNumber: number) => () => void;
};

const NuxtSetupSteps: React.FunctionComponent<NuxtSetupStepProps> = ({
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
        <Flex>
          <pre
            style={{ overflowX: "auto", padding: 8, border: "solid 1px grey" }}
          >
            npm install --save nuxt-sm vue-slicezone @nuxtjs/prismic
            @prismicio/slice-canvas-renderer-vue
          </pre>
        </Flex>
      </Flex>
    </StepSection>
    <StepSection
      stepNumber={2}
      title={"Update your Nuxt config"}
      isOpen={activeStep === 2}
      onOpenStep={onOpenStep(2)}
    >
      <Flex sx={{ flexDirection: "column" }}>
        <Text sx={{ color: "textClear", mb: 2 }}>
          In your nuxt.config.js file, you need to add at the beginning the
          following line:
        </Text>
        <Flex sx={{ mb: 2 }}>
          <pre
            style={{ overflowX: "auto", padding: 8, border: "solid 1px grey" }}
          >
            import smConfig from "./sm.json"
          </pre>
        </Flex>
        <Text sx={{ color: "textClear", mb: 2 }}>
          In your nuxt.config.js file, you need to add at the beginning the
          following line:
        </Text>
        <Flex>
          <pre
            style={{ overflowX: "auto", padding: 8, border: "solid 1px grey" }}
          >
            {NuxtConfigInstructions}
          </pre>
        </Flex>
      </Flex>
    </StepSection>
    <StepSection
      stepNumber={3}
      title={"Create a page for Slice Canvas"}
      isOpen={activeStep === 3}
      onOpenStep={onOpenStep(3)}
    >
      <Flex sx={{ flexDirection: "column" }}>
        <Text sx={{ color: "textClear", mb: 2 }}>
          In your “pages” directory, create a file called _canvas.jsx and add
          the following code. This page is the route you hit to preview and
          develop your components.
        </Text>
        <Flex>
          <pre
            style={{ overflowX: "auto", padding: 8, border: "solid 1px grey" }}
          >
            {SliceCanvasPageCreationInstruction}
          </pre>
        </Flex>
      </Flex>
    </StepSection>
    <StepSection
      stepNumber={4}
      title={"Update sm.json"}
      isOpen={activeStep === 4}
      onOpenStep={onOpenStep(4)}
    >
      <Flex sx={{ flexDirection: "column" }}>
        <Text sx={{ color: "textClear", mb: 2 }}>
          Update your <Text variant={"pre"}>sm.json</Text> file with the
          property <Text variant={"pre"}>localSliceCanvasURL</Text> in the shape
          of <Text variant={"pre"}>http://localhost:PORT/PATH</Text>.
        </Text>
        <Flex>
          <pre
            style={{ overflowX: "auto", padding: 8, border: "solid 1px grey" }}
          >
            {"// eg:\n" +
              '"localSliceCanvasURL": "http://localhost:3000/_canvas"'}
          </pre>
        </Flex>
      </Flex>
    </StepSection>
    <StepSection
      stepNumber={5}
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

const SliceCanvasPageCreationInstruction =
  "<template>\n" +
  '  <SliceCanvasRenderer :state="state" #default="props">\n' +
  '    <SliceZone v-bind="props" />\n' +
  "  </SliceCanvasRenderer>\n" +
  "</template>\n" +
  "\n" +
  "<script>\n" +
  'import { SliceCanvasRenderer } from "@prismicio/slice-canvas-renderer-vue";\n' +
  'import SliceZone from "vue-slicezone";\n' +
  "\n" +
  'import state from "~/.slicemachine/libraries-state.json";\n' +
  "\n" +
  "export default {\n" +
  "  components: {\n" +
  "    SliceCanvasRenderer,\n" +
  "    SliceZone\n" +
  "  },\n" +
  "  data() {\n" +
  "    return { state };\n" +
  "  }\n" +
  "}\n" +
  "</script>";
const NuxtConfigInstructions =
  "// Modules: https://go.nuxtjs.dev/config-modules\n" +
  'modules: [["@nuxtjs/prismic", {\n' +
  '    endpoint: smConfig.apiEndpoint|| ""\n' +
  '}], ["nuxt-sm"]],\n' +
  "\n" +
  "// Build Configuration: https://go.nuxtjs.dev/config-build\n" +
  "build: {\n" +
  '    transpile: ["vue-slicezone", "nuxt-sm"]\n' +
  "}";

export default NuxtSetupSteps;
