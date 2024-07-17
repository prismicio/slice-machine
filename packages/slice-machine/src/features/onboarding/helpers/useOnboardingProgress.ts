import { onboardingSteps as steps } from "@/features/onboarding/content";
import type {
  OnboardingStep,
  OnboardingStepStatuses,
  OnboardingStepType,
} from "@/features/onboarding/types";
import { useLocalStorageItem } from "@/hooks/useLocalStorageItem";

const getInitialState = (): OnboardingStepStatuses => {
  // if the old guide was dismissed, all steps start as complete
  const startComplete =
    localStorage.getItem("slice-machine_isInAppGuideOpen") === "false";

  return Object.fromEntries(
    steps.map((step) => [step.id, startComplete]),
  ) as OnboardingStepStatuses;
};

export const useOnboardingProgress = () => {
  const [stepStatus, setStepStatus] = useLocalStorageItem(
    "onboardingSteps",
    getInitialState(),
  );
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
