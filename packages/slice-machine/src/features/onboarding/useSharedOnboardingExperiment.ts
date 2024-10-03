import { useExperimentVariant } from "@/hooks/useExperimentVariant";

export const useSharedOnboardingExperiment = () => {
  const variant = useExperimentVariant("slicemachine-shared-onboarding");
  return {
    isSharedOnboardingExperimentEligible:
      variant?.value === "with-shared-onboarding",
  };
};
