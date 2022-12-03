import { Box, Flex, Text } from "theme-ui";
import { getStepperConfigurationByFramework } from "./steps";

import React from "react";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  selectOpenedStep,
  selectSetupStatus,
  selectSetupSteps,
  selectUserHasAtLeastOneStepMissing,
  selectUserHasConfiguredAllSteps,
} from "@src/modules/simulator";

import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { Frameworks } from "@slicemachine/core/build/models";
import {
  getFramework,
  getLinkToTroubleshootingDocs,
  selectSimulatorUrl,
} from "@src/modules/environment";
import StepSection from "./components/StepSection";
import WarningSection from "./components/WarningSection";
import HTMLRenderer from "@components/HTMLRenderer";
import { CheckSetup } from "./steps/common";
import { steps } from "./steps/nuxt";
import SuccessSection from "./components/SuccessSection";
import { Button } from "@components/Button";

interface Props {
  framework: Frameworks;
  isSimulatorAvailableForFramework: boolean;
}

export default function Stepper({
  framework,
  isSimulatorAvailableForFramework,
}: Props): React.ReactElement {
  if (!isSimulatorAvailableForFramework) {
    return (
      <p>
        Framework {framework || "undefined"} is not supported yet. Please use
        Storybook instead.
      </p>
    );
  }

  // const stepperConfiguration = getStepperConfigurationByFramework(framework);

  const { toggleSetupDrawerStep, checkSimulatorSetup } =
    useSliceMachineActions();
  const {
    simulatorUrl,
    openedStep,
    setupSteps,
    // setupStatus,
    userHasAtLeastOneStepMissing,
    userHasConfiguredAllSteps,
    linkToTroubleshootingDocs,
    isCheckingSetup,
  } = useSelector((state: SliceMachineStoreType) => ({
    openedStep: selectOpenedStep(state),
    isCheckingSetup: isLoading(state, LoadingKeysEnum.CHECK_SIMULATOR),
    setupSteps: selectSetupSteps(state),
    simulatorUrl: selectSimulatorUrl(state),
    framework: getFramework(state),
    linkToTroubleshootingDocs: getLinkToTroubleshootingDocs(state),
    userHasAtLeastOneStepMissing: selectUserHasAtLeastOneStepMissing(state),
    userHasConfiguredAllSteps: selectUserHasConfiguredAllSteps(state),
  }));

  const stepNumbersWithErrors = (setupSteps || [])
    .map((step, i) => {
      return { ...step, number: i + 1 };
    })
    .filter((step) => {
      return step.isComplete === false;
    })
    .map((step) => {
      return step.number;
    });

  return (
    <div>
      {(setupSteps || []).map((step, i) => {
        const status =
          step.isComplete === true
            ? "ok"
            : step.isComplete === false
            ? "ko"
            : null;

        return (
          <StepSection
            stepNumber={i + 1}
            title={step.title}
            isOpen={openedStep === i + 1}
            onOpenStep={() => toggleSetupDrawerStep(i + 1)}
            status={status}
          >
            <Flex sx={{ flexDirection: "column" }}>
              {step.validationMessages.map((validationMessage) => {
                return (
                  <WarningSection
                    title={validationMessage.title}
                    sx={{ mb: 2 }}
                  >
                    <HTMLRenderer html={validationMessage.message} />
                  </WarningSection>
                );
              })}
              <Text variant={"xs"} sx={{ mb: 3 }}>
                <HTMLRenderer html={step.body} />
              </Text>
            </Flex>
          </StepSection>
          // <div key={step.title}>
          //   <pre>
          //     <code>{JSON.stringify(step, null, 2)}</code>
          //   </pre>
          // </div>
        );
        // return (
        //   <Step
        //     stepNumber={i + 1}
        //     isOpen={openedStep === i + 1}
        //     onOpenStep={() => toggleSetupDrawerStep(i + 1)}
        //     key={`next-step-${i + 1}`}
        //     linkToTroubleshootingDocs={linkToTroubleshootingDocs}
        //     {...{
        //       simulatorUrl,
        //       openedStep,
        //       setupStatus,
        //       userHasAtLeastOneStepMissing,
        //       userHasConfiguredAllSteps,
        //       checkSimulatorSetup,
        //       isCheckingSetup,
        //       stepNumberWithErrors,
        //     }}
        //   />
        // );
      })}
      <StepSection
        title="Check configuration"
        isOpen={openedStep === steps.length}
        onOpenStep={() => toggleSetupDrawerStep(steps.length)}
      >
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
              {stepNumbersWithErrors.length > 0 ? (
                <>
                  <br />
                  Please check step {stepNumbersWithErrors.join(" and ")} for
                  more information.
                </>
              ) : (
                <> Please re-check the above steps.</>
              )}
            </WarningSection>
          )}
          {userHasConfiguredAllSteps ? (
            <SuccessSection />
          ) : (
            <Button
              label="Check configuration"
              sx={{
                maxWidth: 149,
              }}
              isLoading={isCheckingSetup}
              onClick={() => checkSimulatorSetup(false)}
            />
          )}
        </Flex>
      </StepSection>
    </div>
  );
}
