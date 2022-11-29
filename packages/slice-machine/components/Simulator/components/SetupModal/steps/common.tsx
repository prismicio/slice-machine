import React from "react";

import { Flex, Text } from "theme-ui";

import CodeBlock from "../CodeBlock";

export interface SetupStepperConfiguration {
  steps: React.FunctionComponent<DefaultStepCompProps>[];
}

interface DefaultStepProps {
  title?: string;
  code?: string;
}

export interface DefaultStepCompProps {
  stepNumber: number;
  linkToTroubleshootingDocs: string;
}

interface InstallSliceSimulatorProps extends DefaultStepProps {
  code: string;
}

export const InstallSliceSimulator =
  ({
    code,
  }: InstallSliceSimulatorProps): React.FunctionComponent<DefaultStepCompProps> =>
  () => {
    return (
      <Flex sx={{ flexDirection: "column" }}>
        <Text variant={"xs"} sx={{ mb: 3 }}>
          Slice Simulator requires the following dependencies, run the following
          command to install them.
        </Text>
        <CodeBlock>{code}</CodeBlock>
      </Flex>
    );
  };

interface CreatePageProps extends DefaultStepProps {
  code: string;
  instructions: string | React.ReactElement;
}

export const CreatePage =
  ({
    code,
    instructions,
  }: CreatePageProps): React.FunctionComponent<DefaultStepCompProps> =>
  () => {
    return (
      <Flex sx={{ flexDirection: "column" }}>
        <Text variant="xs" sx={{ mb: 3 }}>
          {instructions}
        </Text>
        <CodeBlock>{code}</CodeBlock>
      </Flex>
    );
  };

export const UpdateSmJson =
  ({
    code = `"localSliceSimulatorURL": "http://localhost:3000/slice-simulator"`,
  }: DefaultStepProps): React.FunctionComponent<DefaultStepCompProps> =>
  () => {
    return (
      <Flex sx={{ flexDirection: "column" }}>
        <Text variant={"xs"} sx={{ mb: 3 }}>
          Update your <Text variant={"pre"}>sm.json</Text> file with the
          property{" "}
          <Text as="code" variant="styles.inlineCode">
            localSliceSimulatorURL
          </Text>{" "}
          in the shape of{" "}
          <Text as="code" variant="styles.inlineCode">
            http://localhost:PORT/PATH
          </Text>
          . Eg:
        </Text>
        <CodeBlock>{code}</CodeBlock>
      </Flex>
    );
  };
