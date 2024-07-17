import { getOnboardingStepsContent } from "@/features/onboarding/content";
import type {
  OnboardingStepContent,
  OnboardingStepContentDefinition,
  OnboardingStepType,
} from "@/features/onboarding/types";
import { useRepositoryInformation } from "@/hooks/useRepositoryInformation";

export function useOnboardingStepsContent(): OnboardingStepContent;
export function useOnboardingStepsContent(
  stepId: OnboardingStepType,
): OnboardingStepContentDefinition;
export function useOnboardingStepsContent(
  stepId?: OnboardingStepType,
): OnboardingStepContent | OnboardingStepContentDefinition {
  const { repositoryUrl } = useRepositoryInformation();
  const content = getOnboardingStepsContent({ repositoryUrl });

  if (stepId) return content[stepId];
  return content;
}
