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
        <CodeBlock
          fileName={fileName || "Terminal"}
          FileIcon={FileIcon || BsSquare}
          code={[
            {
              text: yarn,
              version: "yarn",
            },
            {
              text: npm,
              version: "npm",
            },
          ]}
        />
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
          code={{
            text: code,
            version: "js",
          }}
        />
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
          code={{
            text: code,
            version: "JSON",
          }}
        />
      </Flex>
    );
  };
