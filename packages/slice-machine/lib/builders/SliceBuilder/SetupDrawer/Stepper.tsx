import * as steps from "./steps";

import React from "react";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  selectOpenedStep,
  selectSetupStatus,
  selectUserHasAtLeastOneStepMissing,
  selectUserHasConfiguredAllSteps,
} from "@src/modules/preview";

import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { Frameworks } from "@slicemachine/core/build/src/models";
import { getFramework, selectPreviewUrl } from "@src/modules/environment";

interface Props {
  framework: Frameworks | undefined;
}

export default function Stepper({ framework }: Props): React.ReactElement {
  if (framework !== Frameworks.next && framework !== Frameworks.nuxt) {
    return (
      <p>
        Framework {framework || "undefined"} is not supported yet. Please use
        Storybook instead.
      </p>
    );
  }

  const currentSteps = steps[framework];

  const { toggleSetupDrawerStep, checkPreviewSetup } = useSliceMachineActions();
  const {
    previewUrl,
    openedStep,
    setupStatus,
    userHasAtLeastOneStepMissing,
    userHasConfiguredAllSteps,
    isCheckingSetup,
  } = useSelector((state: SliceMachineStoreType) => ({
    openedStep: selectOpenedStep(state),
    isCheckingSetup: isLoading(state, LoadingKeysEnum.CHECK_PREVIEW),
    setupStatus: selectSetupStatus(state),
    previewUrl: selectPreviewUrl(state),
    framework: getFramework(state),
    userHasAtLeastOneStepMissing: selectUserHasAtLeastOneStepMissing(state),
    userHasConfiguredAllSteps: selectUserHasConfiguredAllSteps(state),
  }));

  const stepNumberWithErrors = [
    ...(setupStatus.dependencies === "ko" ? ["1"] : []),
    ...(setupStatus.iframe === "ko"
      ? framework === Frameworks.nuxt
        ? ["2 and 3"]
        : ["2"]
      : []),
    ...(setupStatus.manifest === "ko" ? ["3"] : []),
  ];

  return (
    <div>
      {currentSteps.map((Step, i) => {
        return (
          <Step
            stepNumber={i + 1}
            isOpen={openedStep === i + 1}
            onOpenStep={() => toggleSetupDrawerStep(i + 1)}
            key={`next-step-${i + 1}`}
            {...{
              previewUrl,
              openedStep,
              setupStatus,
              userHasAtLeastOneStepMissing,
              userHasConfiguredAllSteps,
              checkPreviewSetup,
              isCheckingSetup,
              stepNumberWithErrors,
            }}
          />
        );
      })}
    </div>
  );
}
