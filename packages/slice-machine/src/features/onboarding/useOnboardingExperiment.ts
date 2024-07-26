import { useExperimentVariant } from "@/hooks/useExperimentVariant";

export const useOnboardingExperiment = () => {
  const variant = useExperimentVariant("slicemachine-onboarding");
  return { eligible: variant?.value === "on" };
};
