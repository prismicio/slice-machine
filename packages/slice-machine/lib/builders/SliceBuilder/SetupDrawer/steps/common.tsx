import React from "react";

import { Flex, Text } from "theme-ui";

import StepSection from "../components/StepSection";
import SuccessSection from "../components/SuccessSection";
import CodeBlock from "../components/CodeBlockWithCopy";
import WarningSection from "../components/WarningSection";

import SliceMachineButton from "@components/SliceMachineButton";

import { SetupStatus } from "@src/modules/preview/types";

interface DefaultStepProps {
  title?: string;
  code?: string;
}

export interface DefaultStepCompProps {
  isOpen: boolean;
  onOpenStep: () => void;
  stepNumber: number;
  setupStatus: SetupStatus;
}

interface InstallSlicePreviewProps extends DefaultStepProps {
  code: string;
}

export const InstallSlicePreview =
  ({ title = "Install dependencies", code }: InstallSlicePreviewProps) =>
  ({
    isOpen,
    onOpenStep,
    stepNumber,
    setupStatus,
  }: DefaultStepCompProps): React.ReactElement => {
    return (
      <StepSection
        stepNumber={stepNumber}
        title={title}
        isOpen={isOpen}
        onOpenStep={onOpenStep}
        status={setupStatus.dependencies}
      >
        <Flex sx={{ flexDirection: "column" }}>
          {setupStatus.dependencies === "ko" && (
            <WarningSection
              title="Some dependencies are missing"
              sx={{ mb: 2 }}
            />
          )}
          <Text sx={{ color: "textClear", mb: 2 }}>
            Slice Preview requires the following dependencies, run the following
            command to install them.
          </Text>
          <CodeBlock>{code}</CodeBlock>
        </Flex>
      </StepSection>
    );
  };

interface CreatePageProps extends DefaultStepProps {
  code: string;
  instructions: string | React.ReactElement;
}
interface CreatePageCompProps extends DefaultStepCompProps {
  previewUrl: string | undefined;
}

export const CreatePage =
  ({
    title = "Create a page for Slice Preview",
    code,
    instructions,
  }: CreatePageProps) =>
  ({
    isOpen,
    onOpenStep,
    stepNumber,
    setupStatus,
    previewUrl,
  }: CreatePageCompProps): React.ReactElement => {
    return (
      <StepSection
        stepNumber={stepNumber}
        title={title}
        isOpen={isOpen}
        onOpenStep={onOpenStep}
        status={setupStatus.iframe}
      >
        <Flex sx={{ flexDirection: "column" }}>
          {setupStatus.iframe === "ko" && (
            <WarningSection
              title={"We can’t connect to the preview page"}
              sx={{ mb: 3 }}
            >
              We cannot connect to {previewUrl || "preview URL"}. <br />{" "}
              Struggling to fix this issue? See our troubleshooting page.
            </WarningSection>
          )}
          <Text sx={{ color: "textClear", mb: 3 }}>{instructions}</Text>
          <CodeBlock>{code}</CodeBlock>
        </Flex>
      </StepSection>
    );
  };

export const UpdateSmJson =
  ({
    title = "Update sm.json",
    code = `"localSlicePreviewURL": "http://localhost:3000/_preview"`,
  }: DefaultStepProps) =>
  ({
    isOpen,
    onOpenStep,
    stepNumber,
    setupStatus,
  }: DefaultStepCompProps): React.ReactElement => {
    return (
      <StepSection
        stepNumber={stepNumber}
        title={title}
        isOpen={isOpen}
        onOpenStep={onOpenStep}
        status={setupStatus.manifest}
      >
        <Flex sx={{ flexDirection: "column" }}>
          {setupStatus.manifest === "ko" && (
            <WarningSection
              title={"Can’t find “localSlicePreviewURL”"}
              sx={{ mb: 3 }}
            >
              Looks like we can’t find the “localSlicePreviewURL“ property in
              your sm.json file.
            </WarningSection>
          )}
          <Text sx={{ color: "textClear", mb: 3 }}>
            Update your <Text variant={"pre"}>sm.json</Text> file with the
            property <Text variant={"pre"}>localSlicePreviewURL</Text> in the
            shape of <Text variant={"pre"}>http://localhost:PORT/PATH</Text>.
            Eg:
          </Text>
          <CodeBlock>{code}</CodeBlock>
        </Flex>
      </StepSection>
    );
  };

interface CheckSetupComProps extends DefaultStepCompProps {
  userHasAtLeastOneStepMissing: boolean;
  userHasConfiguredAllSteps: boolean;
  checkPreviewSetup: (b: boolean) => void;
  stepNumberWithErrors: string[];
  isCheckingSetup: boolean;
}

export const CheckSetup =
  ({ title = "Check configuration" }: DefaultStepProps) =>
  ({
    isOpen,
    onOpenStep,
    userHasAtLeastOneStepMissing,
    userHasConfiguredAllSteps,
    checkPreviewSetup,
    stepNumberWithErrors,
    isCheckingSetup,
  }: CheckSetupComProps): React.ReactElement => {
    return (
      <StepSection title={title} isOpen={isOpen} onOpenStep={onOpenStep}>
        <Flex sx={{ flexDirection: "column", mx: -24 }}>
          <Text sx={{ color: "textClear", mb: 3 }}>
            After you’re done the previous steps, we need to check that
            everything runs smoothly.
          </Text>
          {userHasAtLeastOneStepMissing && (
            <WarningSection title={""} sx={{ mb: 3 }}>
              We ran into some issues while checking your configuration of Slice
              Preview. Please check step {stepNumberWithErrors.join(" and ")}{" "}
              for more information.
            </WarningSection>
          )}
          {userHasConfiguredAllSteps ? (
            <SuccessSection />
          ) : (
            <SliceMachineButton
              sx={{
                minWidth: 155,
              }}
              isLoading={isCheckingSetup}
              onClick={() => checkPreviewSetup(false)}
            >
              Check configuration
            </SliceMachineButton>
          )}
        </Flex>
      </StepSection>
    );
  };
