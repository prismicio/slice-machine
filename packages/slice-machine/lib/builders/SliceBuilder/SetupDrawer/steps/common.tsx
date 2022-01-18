import React from "react";

import { Flex, Text } from "theme-ui";

import StepSection from "../components/StepSection";
import SuccessSection from "../components/SuccessSection";
import CodeBlock from "../components/CodeBlockWithCopy";
import WarningSection from "../components/WarningSection";

import Button from "@components/Button";

import { SetupStatus } from "@src/modules/preview/types";

export interface SetupStepperConfiguration {
  steps: React.FunctionComponent<DefaultStepCompProps>[];
  getStepNumberWithErrors: (setupStatus: SetupStatus) => string[];
}

interface DefaultStepProps {
  title?: string;
  code?: string;
}

export interface DefaultStepCompProps {
  isOpen: boolean;
  onOpenStep: () => void;
  stepNumber: number;
  setupStatus: SetupStatus;
  simulatorUrl: string | undefined;
  userHasAtLeastOneStepMissing: boolean;
  userHasConfiguredAllSteps: boolean;
  checkSimulatorSetup: (b: boolean) => void;
  stepNumberWithErrors: string[];
  isCheckingSetup: boolean;
}

interface InstallSliceSimulatorProps extends DefaultStepProps {
  code: string;
}

export const InstallSliceSimulator =
  ({
    title = "Install dependencies",
    code,
  }: InstallSliceSimulatorProps): React.FunctionComponent<DefaultStepCompProps> =>
  ({ isOpen, onOpenStep, stepNumber, setupStatus }) => {
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
          <Text variant={"xs"} sx={{ mb: 3 }}>
            Slice Simulator requires the following dependencies, run the
            following command to install them.
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

export const CreatePage =
  ({
    title = "Create a page for Slice Simulator",
    code,
    instructions,
  }: CreatePageProps): React.FunctionComponent<DefaultStepCompProps> =>
  ({ isOpen, onOpenStep, stepNumber, setupStatus, simulatorUrl }) => {
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
              title={"We can’t connect to the simulator page"}
              sx={{ mb: 3 }}
            >
              We cannot connect to {simulatorUrl || "simulator URL"}. <br />{" "}
              Struggling to fix this issue? See our troubleshooting page.
            </WarningSection>
          )}
          <Text variant={"xs"} sx={{ mb: 3 }}>
            {instructions}
          </Text>
          <CodeBlock>{code}</CodeBlock>
        </Flex>
      </StepSection>
    );
  };

export const UpdateSmJson =
  ({
    title = "Update sm.json",
    code = `"localSliceSimulatorURL": "http://localhost:3000/_simulator"`,
  }: DefaultStepProps): React.FunctionComponent<DefaultStepCompProps> =>
  ({ isOpen, onOpenStep, stepNumber, setupStatus }) => {
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
              title={"Can’t find “localSliceSimulatorURL”"}
              sx={{ mb: 3 }}
            >
              Looks like we can’t find the “localSliceSimulatorURL“ property in
              your sm.json file.
            </WarningSection>
          )}
          <Text variant={"xs"} sx={{ mb: 3 }}>
            Update your <Text variant={"pre"}>sm.json</Text> file with the
            property <Text variant={"pre"}>localSliceSimulatorURL</Text> in the
            shape of <Text variant={"pre"}>http://localhost:PORT/PATH</Text>.
            Eg:
          </Text>
          <CodeBlock>{code}</CodeBlock>
        </Flex>
      </StepSection>
    );
  };

export const CheckSetup =
  ({
    title = "Check configuration",
  }: DefaultStepProps): React.FunctionComponent<DefaultStepCompProps> =>
  ({
    isOpen,
    onOpenStep,
    userHasAtLeastOneStepMissing,
    userHasConfiguredAllSteps,
    checkSimulatorSetup,
    stepNumberWithErrors,
    isCheckingSetup,
  }) => {
    return (
      <StepSection title={title} isOpen={isOpen} onOpenStep={onOpenStep}>
        <Flex sx={{ flexDirection: "column", mx: -24 }}>
          <Text variant={"xs"} sx={{ mb: 3 }}>
            Once you’ve completed the previous steps, click the button below to
            verify that your configuration is correct.
          </Text>
          {userHasAtLeastOneStepMissing && (
            <WarningSection
              title={"We are running into some errors"}
              sx={{ mb: 3 }}
            >
              We ran into some issues while checking your configuration.
              <br />
              Please check step {stepNumberWithErrors.join(" and ")} for more
              information.
            </WarningSection>
          )}
          {userHasConfiguredAllSteps ? (
            <SuccessSection />
          ) : (
            <Button
              sx={{
                minWidth: 155,
              }}
              isLoading={isCheckingSetup}
              onClick={() => checkSimulatorSetup(false)}
            >
              Check configuration
            </Button>
          )}
        </Flex>
      </StepSection>
    );
  };
