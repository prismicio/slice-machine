import { getOnboardingStepsContent } from "@/features/onboarding/content";
import type { OnboardingStepContent } from "@/features/onboarding/types";
import { useRepositoryInformation } from "@/hooks/useRepositoryInformation";

export const useOnboardingStepsContent = (): OnboardingStepContent => {
  const { repositoryUrl } = useRepositoryInformation();

  return getOnboardingStepsContent({ repositoryUrl });
};
