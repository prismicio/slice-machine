import {
  Box,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Icon,
  Text,
} from "@prismicio/editor-ui";
import { useReducer } from "react";

import { useOnboardingProgress } from "@/features/onboarding/helpers";
import { OnboardingStepDialog } from "@/features/onboarding/OnboardingStepDialog";
import type { OnboardingStep } from "@/features/onboarding/types";

type DialogState = {
  isOpen: boolean;
  step: OnboardingStep;
};

export const OnboardingProgressStepper = () => {
  const { completedStepCount, steps, isStepComplete } = useOnboardingProgress();

  const [dialog, setDialog] = useReducer(
    (prev: DialogState, next: Partial<DialogState>) => ({ ...prev, ...next }),
    { isOpen: false, step: steps[0] },
  );

  const openDialog = (step: OnboardingStep) => {
    setDialog({ isOpen: true, step });
  };

  return (
    <>
      <OnboardingStepDialog
        step={dialog.step}
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ isOpen: false })}
      />
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button color="grey" sx={{ width: "100%" }}>
            <Box alignItems="center" gap={4}>
              <Text variant="bold" color="grey12">
                {completedStepCount > 0 ? "Continue" : "Start"}
              </Text>
              <Icon name="playCircle" size="small" color="grey11" />
            </Box>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Progress</DropdownMenuLabel>
          {steps.map((step) => {
            const isCompleted = isStepComplete(step);

            return (
              <DropdownMenuItem
                key={step.id}
                onSelect={() => openDialog(step)}
                startIcon={
                  <Icon
                    color={isCompleted ? "green10" : "currentColor"}
                    name={isCompleted ? "checkBox" : "checkBoxOutlinedBlank"}
                  />
                }
                description={step.title}
              >
                {step.title}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
