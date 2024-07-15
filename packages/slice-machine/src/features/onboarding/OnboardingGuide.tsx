import { Text } from "@prismicio/editor-ui";

import { useOnboardingProgress } from "@/features/onboarding/helpers";
import { OnboardingProgressStepper } from "@/features/onboarding/OnboardingProgressStepper";

import styles from "./OnboardingGuide.module.css";

export const OnboardingGuide = () => {
  const { steps, completedStepCount, isComplete } = useOnboardingProgress();

  if (isComplete) return null;

  return (
    <div className={styles.onboardingCard}>
      <div>
        <Text variant="bold" color="grey12">
          Welcome
        </Text>
        <Text color="grey11" variant="small">
          Get started in {steps.length} steps
        </Text>
      </div>
      <Text color="grey11" variant="small" align="end">
        {completedStepCount}/{steps.length}
      </Text>
      <OnboardingProgressStepper />
    </div>
  );
};
