import { useExperimentVariant } from "@/hooks/useExperimentVariant";

export const useSharedOnboardingExperiment = () => {
  const variant = useExperimentVariant("slicemachine-shared-onboarding");
  return { eligible: variant?.value === "with-shared-onboarding" };
};
