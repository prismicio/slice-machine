import {
  Dialog,
  DialogActions,
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
  const [ctaOkText, updateCtaOkText] = useUpdatableState(() => {
    return isStepComplete(step.id) ? "Undo step" : "Mark as done";
  });

  const execIfOpen = (fn: () => void) => () => {
    if (!isOpen) return;
    fn();
  };

  const markAsDone = () => {
    toggleStepComplete(step.id);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      onAnimationEnd={execIfOpen(updateCtaOkText)}
      onAnimationStart={execIfOpen(updateCtaOkText)}
      size="small"
    >
      <DialogHeader title="Onboarding" />
      <DialogContent>
        <OnboardingStepDialogContent step={step} />
        <DialogActions
          ok={{ text: ctaOkText, onClick: execIfOpen(markAsDone) }}
          cancel={{ text: "Close" }}
          size="medium"
        />
      </DialogContent>
    </Dialog>
  );
};

function useUpdatableState<T>(getValue: () => T): [T, () => void] {
  const [state, setState] = useState(getValue());
  return [state, () => setState(getValue())];
}
