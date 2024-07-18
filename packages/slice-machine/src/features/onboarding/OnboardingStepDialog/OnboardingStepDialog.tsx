import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
} from "@prismicio/editor-ui";

import { useOnboardingContext } from "@/features/onboarding/OnboardingProvider";
import { OnboardingStepDialogContent } from "@/features/onboarding/OnboardingStepDialog/OnboardingStepDialogContent";
import type { OnboardingStep } from "@/features/onboarding/types";

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
  const { toggleStepComplete, isStepComplete } = useOnboardingContext();

  const markAsDone = () => {
    if (!isOpen) return;
    toggleStepComplete(step.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader title="Learn" />
      <DialogContent>
        <OnboardingStepDialogContent step={step} />
        <DialogActions
          ok={{
            text: isStepComplete(step.id) ? "Undo step" : "Mark as done",
            onClick: markAsDone,
          }}
          cancel={{ text: "Close" }}
        />
      </DialogContent>
    </Dialog>
  );
};
