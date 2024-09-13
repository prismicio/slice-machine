import { useExperimentVariant } from "@/hooks/useExperimentVariant";

type UseOnboardingCardVisibilityExperimentReturnType = {
  eligible: boolean;
  variant?: string;
};

export function useOnboardingCardVisibilityExperiment(): UseOnboardingCardVisibilityExperimentReturnType {
  const variant = useExperimentVariant(
    "slicemachine-onboarding-card-visibility",
  );

  const isExperimentEligible =
    variant?.value === "light" || variant?.value === "dark";

  return {
    eligible: isExperimentEligible,
    variant: isExperimentEligible ? variant?.value : undefined,
  };
}
