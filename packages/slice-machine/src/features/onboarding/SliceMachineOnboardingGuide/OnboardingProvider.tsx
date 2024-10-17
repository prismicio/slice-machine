import { createContext, ReactNode, useContext } from "react";

import { telemetry } from "@/apiClient";
import { onboardingSteps } from "@/features/onboarding/SliceMachineOnboardingGuide/content";
import {
  type OnboardingStep,
  type OnboardingStepId,
  type OnboardingStepStatuses,
  onboardingStepStatusesSchema,
} from "@/features/onboarding/SliceMachineOnboardingGuide/types";
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
    steps.map((step) => [
      step.id,
      step.defaultCompleted ?? wasOldGuideDismissed,
    ]),
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
  const steps = onboardingSteps;

  const [stepStatus, setStepStatus] = usePersistedState(
    "onboardingSteps",
    getInitialState(steps),
    { schema: onboardingStepStatusesSchema },
  );

  const toggleStepComplete = (step: OnboardingStep) => {
    const newCompleteState = !isStepComplete(step);
    const nextState = { ...stepStatus, [step.id]: newCompleteState };
    setStepStatus(nextState);

    if (newCompleteState) {
      void telemetry.track({
        event: "shared-onboarding:step-completed",
        stepId: step.id,
        stepTitle: step.title,
        source: "SliceMachine",
      });
    }
    if (Object.values(nextState).every(Boolean)) {
      onComplete?.();
      void telemetry.track({
        event: "shared-onboarding:completed",
        source: "SliceMachine",
      });
    }
  };

  const getStepIndex = (stepId: OnboardingStepId) => {
    return steps.findIndex(({ id }) => id === stepId);
  };

  const isStepComplete = (step: OnboardingStep) => {
    return Boolean(stepStatus[step.id]) || Boolean(step.defaultCompleted);
  };

  const completedStepCount = steps.filter((step) =>
    isStepComplete(step),
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
