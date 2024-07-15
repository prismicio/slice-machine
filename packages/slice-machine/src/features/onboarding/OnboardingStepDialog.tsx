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
  OnboardingStep,
  useOnboardingProgress,
} from "@/features/onboarding/helpers";

type OnboardingStepDialogProps = {
  step: OnboardingStep | undefined;
  onClose: () => void;
};

export const OnboardingStepDialog = ({
  step,
  onClose,
}: OnboardingStepDialogProps) => {
  const { toggleStepComplete, stepStatus, steps } = useOnboardingProgress();

  if (!step) return null;

  const markAsDone = () => {
    toggleStepComplete(step.id);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogHeader title={step.title} />
      <DialogContent>
        <ScrollArea>
          <Text color="purple9" variant="bold">
            Step {steps.findIndex(({ id }) => id === step.id) + 1}
          </Text>
          {typeof step.description === "string" ? (
            <Text>{step.description}</Text>
          ) : (
            <step.description />
          )}
          <Video src={step.videoUrl} sizing="contain" autoPlay loop />
        </ScrollArea>
        <DialogActions
          ok={{
            text: stepStatus[step.id] ? "Undo step" : "Mark as done",
            onClick: markAsDone,
          }}
          cancel={{ text: "Close" }}
        />
      </DialogContent>
    </Dialog>
  );
};
