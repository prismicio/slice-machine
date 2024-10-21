import { Box, ScrollArea, Text, Video } from "@prismicio/editor-ui";

import { useOnboardingContext } from "@/features/onboarding/SliceMachineOnboardingGuide/OnboardingProvider";
import { OnboardingStep } from "@/features/onboarding/SliceMachineOnboardingGuide/types";

type OnboardingStepDialogContentProps = {
  step: OnboardingStep;
};

export function OnboardingStepDialogContent(
  props: OnboardingStepDialogContentProps,
) {
  const { step } = props;
  const { getStepIndex } = useOnboardingContext();

  const { content: Content, videoUrl, title = step.title } = step;

  return (
    <ScrollArea>
      <Box as="article" flexDirection="column" padding={16} gap={16}>
        <section>
          <Text sx={{ marginBottom: 4 }} color="purple9" variant="bold">
            Step {getStepIndex(step.id) + 1}
          </Text>
          <Text variant="h3">{title}</Text>
          {Content && <Content />}
        </section>
        {typeof videoUrl == "string" && (
          <Video src={videoUrl} sizing="contain" autoPlay loop />
        )}
      </Box>
    </ScrollArea>
  );
}
