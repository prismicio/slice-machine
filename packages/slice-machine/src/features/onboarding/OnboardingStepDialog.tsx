import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  ScrollArea,
  Text,
  Video,
} from "@prismicio/editor-ui";

import {
  useOnboardingProgress,
  useOnboardingStepsContent,
} from "@/features/onboarding/helpers";
import type { OnboardingStep } from "@/features/onboarding/types";

import styles from "./OnboardingStepDialog.module.css";

type OnboardingStepDialogProps = {
  step: OnboardingStep;
  isOpen: boolean;
  onClose: () => void;
};

export const OnboardingStepDialog = ({
  step,
  isOpen,
  onClose,
}: OnboardingStepDialogProps) => {
  const { toggleStepComplete, isStepComplete, getStepIndex } =
    useOnboardingProgress();
  const content = useOnboardingStepsContent();
  const stepContent = content[step.id];

  const markAsDone = () => {
    if (!isOpen) return;
    toggleStepComplete(step.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader title="Learn" />
      <DialogContent>
        <ScrollArea>
          <div className={styles.content}>
            <div className={styles.contentHeader}>
              <Text color="purple9" variant="bold">
                Step {getStepIndex(step) + 1}
              </Text>
              <Text variant="h3">{stepContent.title ?? step.title}</Text>
              {typeof stepContent.content === "string" ? (
                <Text>{stepContent.content}</Text>
              ) : (
                <stepContent.content />
              )}
            </div>
            <Video src={stepContent.videoUrl} sizing="contain" autoPlay loop />
          </div>
        </ScrollArea>
        <DialogActions
          ok={{
            text: isStepComplete(step) ? "Undo step" : "Mark as done",
            onClick: markAsDone,
          }}
          cancel={{ text: "Close" }}
        />
      </DialogContent>
    </Dialog>
  );
};
