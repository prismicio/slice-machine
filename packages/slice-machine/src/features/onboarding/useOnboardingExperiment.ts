import { useExperimentVariant } from "@/hooks/useExperimentVariant";

export const useIsOnboardingEnabled = () => {
  return useExperimentVariant("slice-machine-onboarding")?.value === "on";
};
