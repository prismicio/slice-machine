import { useExperimentVariant } from "@/hooks/useExperimentVariant";

export const useSharedOnboardingExperiment = () => {
  const variant = useExperimentVariant("shared-onboarding-new");
  return { eligible: variant?.value === "with-shared-onboarding" };
};
