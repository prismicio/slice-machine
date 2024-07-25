import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Icon,
} from "@prismicio/editor-ui";
import { useState } from "react";

import { telemetry } from "@/apiClient";
import { useOnboardingContext } from "@/features/onboarding/OnboardingProvider";
import { OnboardingStepDialog } from "@/features/onboarding/OnboardingStepDialog";
import type { OnboardingStep } from "@/features/onboarding/types";

const EndCtaIcon = () => <Icon name="playCircle" size="small" color="grey11" />;

export const OnboardingProgressStepper = () => {
  const { completedStepCount, steps, isStepComplete } = useOnboardingContext();

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(steps[0]);

  const showStep = (step: OnboardingStep) => {
    setActiveStep(step);
    setDialogOpen(true);
    void telemetry.track({
      event: "onboarding:step-opened",
      stepId: step.id,
      stepTitle: step.title,
    });
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
          <Button
            color="grey"
            sx={{ width: "100%" }}
            renderEndIcon={EndCtaIcon}
          >
            {completedStepCount > 0 ? "Continue" : "Start"}
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
                description={step.description}
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
