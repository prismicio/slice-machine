import React from "react";
import { IconType } from "react-icons";

import { Flex, Text } from "theme-ui";

import CodeBlock from "../CodeBlock";
import { BsSquare } from "react-icons/bs";
import { VscBracketDot } from "react-icons/vsc";
import { AiOutlineFileText } from "react-icons/ai";
import { Excerpt } from "./excerpts";

export interface SetupStepperConfiguration {
  steps: React.FunctionComponent<DefaultStepCompProps>[];
  excerpts: Excerpt[];
}

interface DefaultStepProps {
  title?: string;
  code?: string;
}

export interface DefaultStepCompProps {
  stepNumber: number;
  linkToTroubleshootingDocs: string;
  linkToStorybookDocs: string;
}

interface InstallSliceSimulatorProps extends DefaultStepProps {
  npm: string;
  yarn: string;
  fileName?: string;
  FileIcon?: IconType;
}

export const InstallSliceSimulator =
  ({
    npm,
    yarn,
    fileName,
    FileIcon,
  }: InstallSliceSimulatorProps): React.FunctionComponent<DefaultStepCompProps> =>
  () => {
    return (
      <Flex sx={{ flexDirection: "column", height: "100%" }}>
        <Text as="p" mb={2}>
          Run this command to install the simulator package via npm:
        </Text>
        <CodeBlock
          fileName={fileName || "Terminal (npm)"}
          FileIcon={FileIcon || BsSquare}
        >
          {npm}
        </CodeBlock>
        <Text as="p" my={2}>
          Alternatively, you can use yarn:
        </Text>
        <CodeBlock
          fileName={fileName || "Terminal (yarn)"}
          FileIcon={FileIcon || BsSquare}
        >
          {yarn}
        </CodeBlock>
      </Flex>
    );
  };

interface CreatePageProps extends DefaultStepProps {
  code: string;
  instructions?: string | React.ReactElement;
  fileName?: string;
  FileIcon?: IconType;
}

export const CreatePage =
  ({
    code,
    instructions,
    fileName,
    FileIcon,
  }: CreatePageProps): React.FunctionComponent<DefaultStepCompProps> =>
  () => {
    return (
      <Flex sx={{ flexDirection: "column", height: "100%" }}>
        {instructions ? (
          <Text variant="xs" sx={{ mb: 3 }}>
            {instructions}
          </Text>
        ) : null}
        <CodeBlock
          fileName={fileName || "slice-simulator.js"}
          FileIcon={FileIcon || AiOutlineFileText}
        >
          {code}
        </CodeBlock>
      </Flex>
    );
  };

export const UpdateSmJson =
  ({
    code = `{
  "_latest": "0.3.0",
  "apiEndpoint": "https://project.prismic.io/api/v2",
  "libraries": [
    "@/slices"
  ],
  "localSliceSimulatorURL": "http://localhost:3000/slice-simulator"
}`,
  }: DefaultStepProps): React.FunctionComponent<DefaultStepCompProps> =>
  () => {
    return (
      <Flex sx={{ flexDirection: "column", height: "100%" }}>
        <CodeBlock
          FileIcon={VscBracketDot}
          fileName="sm.json"
          lang="json"
          customCopyText={`"localSliceSimulatorURL": "http://localhost:3000/slice-simulator"`}
        >
          {code}
        </CodeBlock>
      </Flex>
    );
  };
