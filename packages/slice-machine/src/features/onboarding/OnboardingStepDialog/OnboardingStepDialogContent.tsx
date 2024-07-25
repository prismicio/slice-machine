import { Box, ScrollArea, Text, Video } from "@prismicio/editor-ui";

import { onboardingStepContent } from "@/features/onboarding/content";
import { useOnboardingContext } from "@/features/onboarding/OnboardingProvider";
import { OnboardingStep } from "@/features/onboarding/types";

type OnboardingStepDialogContentProps = {
  step: OnboardingStep;
};

export const OnboardingStepDialogContent = ({
  step,
}: OnboardingStepDialogContentProps) => {
  const { getStepIndex } = useOnboardingContext();

  const {
    content: Content,
    videoUrl,
    title = step.title,
  } = onboardingStepContent[step.id];

  return (
    <ScrollArea>
      <Box as="article" flexDirection="column" padding={16} gap={16}>
        <section>
          <Text sx={{ marginBottom: 4 }} color="purple9" variant="bold">
            Step {getStepIndex(step) + 1}
          </Text>
          <Text variant="h3">{title}</Text>
          <Content />
        </section>
        <Video src={videoUrl} sizing="contain" autoPlay loop />
      </Box>
    </ScrollArea>
  );
};
