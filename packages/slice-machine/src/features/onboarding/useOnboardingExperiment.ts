import { useExperimentVariant } from "@/hooks/useExperimentVariant";

export const useOnboardingExperiment = () => {
  const variant = useExperimentVariant("slice-machine-onboarding");
  return { eligible: variant?.value === "on" };
};
