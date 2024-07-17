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
import { useState } from "react";

import { useOnboardingProgress } from "@/features/onboarding/helpers";
import { OnboardingStepDialog } from "@/features/onboarding/OnboardingStepDialog";
import type { OnboardingStep } from "@/features/onboarding/types";

export const OnboardingProgressStepper = () => {
  const { completedStepCount, steps, isStepComplete } = useOnboardingProgress();

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(steps[0]);

  const showStep = (step: OnboardingStep) => {
    setActiveStep(step);
    setDialogOpen(true);
  };

  return (
    <>
      <OnboardingStepDialog
        step={activeStep}
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
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
                onSelect={() => showStep(step)}
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
