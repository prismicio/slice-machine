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

import { telemetry } from "@/apiClient";

import { useOnboardingContext } from "./OnboardingProvider";
import { OnboardingStepDialog } from "./OnboardingStepDialog";
import type { OnboardingStep } from "./types";

const EndCtaIcon = () => <Icon name="playCircle" size="small" color="grey11" />;

interface OnboardingProgressStepperProps {
  buttonSize?: "large" | "medium";
}
export function OnboardingProgressStepper(
  props: OnboardingProgressStepperProps,
) {
  const { buttonSize = "medium" } = props;
  const { completedStepCount, steps, isStepComplete, isComplete } =
    useOnboardingContext();

  const [isListOpen, setListOpen] = useState(false);
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
      <DropdownMenu open={isListOpen} onOpenChange={setListOpen}>
        <DropdownMenuTrigger>
          <Button
            disabled={isComplete}
            size={buttonSize}
            color="grey"
            sx={{ width: "100%" }}
            renderEndIcon={EndCtaIcon}
            {...{ onMouseEnter: () => setListOpen(true) }}
          >
            {completedStepCount > 0 ? "Continue" : "Start now"}
          </Button>
        </DropdownMenuTrigger>
        {/* The sideOffset is used to align the list with the bottom of the onboarding card */}
        <DropdownMenuContent align="center" sideOffset={-50} minWidth={256}>
          <div onMouseLeave={() => setListOpen(false)}>
            <DropdownMenuLabel>
              <Text variant="small" color="grey11" sx={{ marginInline: 8 }}>
                Progress
              </Text>
            </DropdownMenuLabel>
            {steps.map((step, index) => {
              const isCompleted = isStepComplete(step);

              return (
                <DropdownMenuItem
                  key={step.id}
                  onSelect={() => showStep(step)}
                  description={step.description}
                  completed={isCompleted}
                  readOnly={step.defaultCompleted}
                  endAdornment={
                    step.defaultCompleted !== true && (
                      <Icon name="chevronRight" size="small" color="grey11" />
                    )
                  }
                >
                  {`${index + 1} ${step.title}`}
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
