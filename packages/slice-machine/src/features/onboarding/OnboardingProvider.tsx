import { createContext, ReactNode, useContext } from "react";

import { telemetry } from "@/apiClient";
import {
  onboardingExperimentSteps,
  onboardingSteps,
} from "@/features/onboarding/content";
import {
  type OnboardingStep,
  type OnboardingStepId,
  type OnboardingStepStatuses,
  onboardingStepStatusesSchema,
} from "@/features/onboarding/types";
import { useOnboardingCardVisibilityExperiment } from "@/features/onboarding/useOnboardingCardVisibilityExperiment";
import { usePersistedState } from "@/hooks/usePersistedState";

type OnboardingContext = {
  steps: OnboardingStep[];
  completedStepCount: number;
  toggleStepComplete: (step: OnboardingStep) => void;
  getStepIndex: (step: OnboardingStepId) => number;
  isStepComplete: (step: OnboardingStep) => boolean;
  isComplete: boolean;
};

export const OnboardingContext = createContext<OnboardingContext | undefined>(
  undefined,
);

const getInitialState = (steps: OnboardingStep[]): OnboardingStepStatuses => {
  // if the old guide was dismissed, all steps start as complete
  const wasOldGuideDismissed =
    localStorage.getItem("slice-machine_isInAppGuideOpen") === "false";

  return Object.fromEntries(
    steps.map((step) => [step.id, step.readonly ?? wasOldGuideDismissed]),
  ) as OnboardingStepStatuses;
};

type OnboardingProviderProps = {
  children: ReactNode;
  onComplete?: () => void;
};

export const OnboardingProvider = ({
  children,
  onComplete,
}: OnboardingProviderProps) => {
  const { eligible } = useOnboardingCardVisibilityExperiment();
  const steps = eligible ? onboardingExperimentSteps : onboardingSteps;

  const [stepStatus, setStepStatus] = usePersistedState(
    "onboardingSteps",
    getInitialState(steps),
    { schema: onboardingStepStatusesSchema },
  );

  const toggleStepComplete = (step: OnboardingStep) => {
    const isComplete = !stepStatus[step.id];
    const nextState = { ...stepStatus, [step.id]: isComplete };
    setStepStatus(nextState);

    if (isComplete) {
      void telemetry.track({
        event: "onboarding:step-completed",
        stepId: step.id,
        stepTitle: step.title,
      });
    }
    if (Object.values(nextState).every(Boolean)) {
      onComplete?.();
      void telemetry.track({ event: "onboarding:completed" });
    }
  };

  const getStepIndex = (stepId: OnboardingStepId) => {
    return steps.findIndex(({ id }) => id === stepId);
  };

  const isStepComplete = (step: OnboardingStep) => {
    return stepStatus[step.id] ?? false;
  };

  const stepsIds = steps.map(({ id }) => id);
  const completedStepCount = Object.entries(stepStatus).filter(
    // filtering out steps that are not part of the current experiment variant
    ([key, value]) => stepsIds.includes(key as OnboardingStepId) && value,
  ).length;

  return (
    <OnboardingContext.Provider
      value={{
        steps,
        toggleStepComplete,
        isStepComplete,
        getStepIndex,
        completedStepCount,
        isComplete: completedStepCount === steps.length,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboardingContext = () => {
  const context = useContext(OnboardingContext);

  if (context == null) {
    throw new Error(
      "useOnboardingContext must be used within an OnboardingProvider",
    );
  }

  return context;
};
