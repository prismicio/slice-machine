import { Dispatch, SetStateAction, useEffect, useRef } from "react";

import {
  getOnboardingStepsContent,
  onboardingSteps as steps,
} from "@/features/onboarding/content";
import type {
  OnboardingStep,
  OnboardingStepContent,
  OnboardingStepStatuses,
  OnboardingStepType,
} from "@/features/onboarding/types";
import { useLocalStorageItem } from "@/hooks/useLocalStorageItem";
import { useRepositoryInformation } from "@/hooks/useRepositoryInformation";

export const useOnboardingStepsContent = (): OnboardingStepContent => {
  const { repositoryUrl } = useRepositoryInformation();

  return getOnboardingStepsContent({ repositoryUrl });
};

const getInitialState = (): OnboardingStepStatuses => {
  // if the old guide was dismissed, all steps start as complete
  const startComplete =
    localStorage.getItem("slice-machine_isInAppGuideOpen") === "false";

  return Object.fromEntries(
    steps.map((step) => [step.id, startComplete]),
  ) as OnboardingStepStatuses;
};

const useOnboardingStepStatus = (): [
  OnboardingStepStatuses,
  Dispatch<SetStateAction<OnboardingStepStatuses>>,
] => {
  const initialState = useRef(getInitialState()).current;
  const [status, setStatus, { isUnset: isStatusUnset }] =
    useLocalStorageItem<OnboardingStepStatuses>(
      "onboardingSteps",
      initialState,
    );

  useEffect(() => {
    // populate onboarding status if not defined
    if (isStatusUnset) setStatus(initialState);

    /* eslint-disable-next-line react-hooks/exhaustive-deps -- 
    We don't care if the values of isStatusUnset, setStatus or initialState change here. */
  }, [status]);

  return [status, setStatus];
};

export const useOnboardingProgress = () => {
  const [stepStatus, setStepStatus] = useOnboardingStepStatus();
  const completedStepCount = Object.values(stepStatus).filter(Boolean).length;

  const toggleStepComplete = (step: OnboardingStepType) => {
    setStepStatus((prev) => ({ ...prev, [step]: !prev[step] }));
  };

  const getStepIndex = (stepOrId: OnboardingStep | OnboardingStepType) => {
    return steps.findIndex(({ id }) => {
      return id === (typeof stepOrId === "string" ? stepOrId : stepOrId.id);
    });
  };

  const isStepComplete = (stepOrId: OnboardingStep | OnboardingStepType) => {
    return (
      stepStatus[typeof stepOrId === "string" ? stepOrId : stepOrId.id] ?? false
    );
  };

  return {
    steps,
    getStepIndex,
    isStepComplete,
    completedStepCount,
    toggleStepComplete,
    isComplete: completedStepCount === steps.length,
  };
};
