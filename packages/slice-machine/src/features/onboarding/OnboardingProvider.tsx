import { createContext, ReactNode, useContext } from "react";

import { onboardingSteps as steps } from "@/features/onboarding/content";
import type {
  OnboardingStep,
  OnboardingStepStatuses,
  OnboardingStepType,
} from "@/features/onboarding/types";
import { usePersistedState } from "@/hooks/usePersistedState";

type OnboardingContext = {
  steps: OnboardingStep[];
  completedStepCount: number;
  toggleStepComplete: (step: OnboardingStepType) => void;
  getStepIndex: (stepOrId: OnboardingStep | OnboardingStepType) => number;
  isStepComplete: (stepOrId: OnboardingStep | OnboardingStepType) => boolean;
  isComplete: boolean;
};

export const OnboardingContext = createContext<OnboardingContext | undefined>(
  undefined,
);

const getInitialState = (): OnboardingStepStatuses => {
  // if the old guide was dismissed, all steps start as complete
  const wasOldGuideDismissed =
    localStorage.getItem("slice-machine_isInAppGuideOpen") === "false";

  return Object.fromEntries(
    steps.map((step) => [step.id, wasOldGuideDismissed]),
  ) as OnboardingStepStatuses;
};

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [stepStatus, setStepStatus] = usePersistedState(
    "onboardingSteps",
    getInitialState(),
    { storeDefaultValue: true },
  );

  const toggleStepComplete = (step: OnboardingStepType) => {
    setStepStatus((current) => ({ ...current, [step]: !current[step] }));
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

  const completedStepCount = Object.values(stepStatus).filter(Boolean).length;

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
