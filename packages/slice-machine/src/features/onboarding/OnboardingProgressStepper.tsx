import {
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

import { useOnboardingContext } from "@/features/onboarding/OnboardingProvider";
import { OnboardingStepDialog } from "@/features/onboarding/OnboardingStepDialog";
import type { OnboardingStep } from "@/features/onboarding/types";

const EndCtaIcon = () => <Icon name="playCircle" size="small" color="grey11" />;

export const OnboardingProgressStepper = () => {
  const { completedStepCount, steps, isStepComplete } = useOnboardingContext();

  const [isListOpen, setListOpen] = useState(false);
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
      <DropdownMenu open={isListOpen} onOpenChange={setListOpen}>
        <DropdownMenuTrigger>
          <Button
            color="grey"
            sx={{ width: "100%" }}
            renderEndIcon={EndCtaIcon}
            onMouseEnter={() => setListOpen(true)}
          >
            {completedStepCount > 0 ? "Continue" : "Start"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" sideOffset={-56} minWidth={256}>
          <div
            onMouseLeave={() => {
              setListOpen(false);
            }}
          >
            <DropdownMenuLabel>
              <Text variant="small" color="grey11">
                Progress
              </Text>
            </DropdownMenuLabel>
            {steps.map((step) => {
              const isCompleted = isStepComplete(step.id);

              return (
                <DropdownMenuItem
                  key={step.id}
                  onSelect={() => showStep(step)}
                  description={step.description}
                  completed={isCompleted}
                  endAdornment={
                    <Icon name="chevronRight" size="small" color="grey11" />
                  }
                >
                  {step.title}
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
