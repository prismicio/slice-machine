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

import {
  OnboardingStep,
  useOnboardingProgress,
} from "@/features/onboarding/helpers";
import { OnboardingStepDialog } from "@/features/onboarding/OnboardingStepDialog";

export const OnboardingProgressMenu = () => {
  const [activeStep, setActiveStep] = useState<OnboardingStep>();
  const { completedStepCount, steps, stepStatus } = useOnboardingProgress();

  return (
    <>
      <OnboardingStepDialog
        step={activeStep}
        onClose={() => setActiveStep(undefined)}
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
            const isCompleted = stepStatus[step.id];

            return (
              <DropdownMenuItem
                key={step.id}
                onSelect={() => setActiveStep(step)}
                startIcon={
                  <Icon
                    color={isCompleted ? "green10" : "currentColor"}
                    name={isCompleted ? "checkBox" : "checkBoxOutlinedBlank"}
                  />
                }
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
