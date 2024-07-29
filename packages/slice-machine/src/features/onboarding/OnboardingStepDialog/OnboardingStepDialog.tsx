import {
  Dialog,
  DialogActionButton,
  DialogActions,
  DialogCancelButton,
  DialogContent,
  DialogHeader,
} from "@prismicio/editor-ui";
import { useState } from "react";

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
  const [ctaOkText, setCtaOkText] = useState(getCtaOkText);

  function getCtaOkText() {
    return isStepComplete(step) ? "Undo step" : "Mark as done";
  }

  const markAsDone = () => {
    if (!isOpen) return;
    toggleStepComplete(step);
    onClose();
  };

  const updateCtaOkText = () => {
    if (!isOpen) return;
    setCtaOkText(getCtaOkText());
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      onAnimationEnd={updateCtaOkText}
      onAnimationStart={updateCtaOkText}
      size="small"
    >
      <DialogHeader title="Onboarding" />
      <DialogContent>
        <OnboardingStepDialogContent step={step} />
        <DialogActions>
          <DialogCancelButton size="medium">Close</DialogCancelButton>
          <DialogActionButton size="medium" onClick={markAsDone}>
            {ctaOkText}
          </DialogActionButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};
