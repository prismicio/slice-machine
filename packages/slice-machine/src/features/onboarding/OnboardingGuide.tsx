import {
  Card,
  CardContent,
  ProgressBar,
  Text,
  useMediaQuery,
} from "@prismicio/editor-ui";

import { OnboardingProgressStepper } from "@/features/onboarding/OnboardingProgressStepper";
import {
  OnboardingProvider,
  useOnboardingContext,
} from "@/features/onboarding/OnboardingProvider";
import { useOnboardingExperiment } from "@/features/onboarding/useOnboardingExperiment";

const OnboardingGuideContent = () => {
  const { steps, completedStepCount, isComplete } = useOnboardingContext();
  const visible = useMediaQuery({ min: "medium" });

  if (isComplete || !visible) return null;

  return (
    <Card color="grey2" variant="outlined" paddingBlock={16}>
      <CardContent>
        <div>
          <Text variant="bold" color="grey12">
            Build a page in {steps.length} steps
          </Text>
          <Text color="grey11" variant="small">
            Render a live page with content coming from Prismic
          </Text>
        </div>
        <ProgressBar
          value={completedStepCount}
          max={steps.length}
          displayLabel
          getValueLabel={(value, max) => `${value}/${max}`}
        />
        <OnboardingProgressStepper />
      </CardContent>
    </Card>
  );
};

export const OnboardingGuide = () => {
  const { eligible } = useOnboardingExperiment();

  if (!eligible) return null;

  return (
    <OnboardingProvider>
      <OnboardingGuideContent />
    </OnboardingProvider>
  );
};
