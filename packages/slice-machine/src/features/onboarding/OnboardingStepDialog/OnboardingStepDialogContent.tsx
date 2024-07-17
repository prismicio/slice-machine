import { ScrollArea, Text, Video } from "@prismicio/editor-ui";

import { getOnboardingStepsContent } from "@/features/onboarding/content";
import { useOnboardingContext } from "@/features/onboarding/OnboardingProvider";
import { OnboardingStep } from "@/features/onboarding/types";
import { useRepositoryInformation } from "@/hooks/useRepositoryInformation";

import styles from "./OnboardingStepDialogContent.module.css";

type OnboardingStepDialogContentProps = {
  step: OnboardingStep;
};

export const OnboardingStepDialogContent = ({
  step,
}: OnboardingStepDialogContentProps) => {
  const { getStepIndex } = useOnboardingContext();
  const { repositoryUrl } = useRepositoryInformation();

  const {
    content: Content,
    videoUrl,
    title,
  } = getOnboardingStepsContent({ repositoryUrl })[step.id];

  return (
    <ScrollArea>
      <article className={styles.scrollableContent}>
        <section>
          <Text sx={{ marginBottom: 4 }} color="purple9" variant="bold">
            Step {getStepIndex(step) + 1}
          </Text>
          <Text variant="h3">{title}</Text>
          <Content />
        </section>
        <Video src={videoUrl} sizing="contain" autoPlay loop />
      </article>
    </ScrollArea>
  );
};
