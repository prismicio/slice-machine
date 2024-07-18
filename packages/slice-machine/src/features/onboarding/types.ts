import { z } from "zod";

import { onboardingSteps } from "@/features/onboarding/content";

export type OnboardingStepType =
  | "createPage"
  | "codePage"
  | "addSlice"
  | "writeContent"
  | "pushModels";

export type OnboardingStep = {
  id: OnboardingStepType;
  title: string;
  description: string;
};

export type OnboardingStepContentDefinition = {
  title?: string;
  content: () => JSX.Element;
  videoUrl: string;
};

export const onboardingStepStatusesSchema = z.object(
  Object.fromEntries(
    onboardingSteps.map((step) => [step.id, z.boolean()]),
  ) as Record<OnboardingStepType, z.ZodBoolean>,
);

export type OnboardingStepStatuses = z.infer<
  typeof onboardingStepStatusesSchema
>;

export type OnboardingStepContent = Record<
  OnboardingStepType,
  OnboardingStepContentDefinition
>;
