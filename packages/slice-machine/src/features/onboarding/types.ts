import { z } from "zod";

export const onboardingStepStatusesSchema = z.object({
  createPage: z.boolean(),
  codePage: z.boolean(),
  addSlice: z.boolean(),
  writeContent: z.boolean(),
  pushModels: z.boolean(),
});

export type OnboardingStepStatuses = z.infer<
  typeof onboardingStepStatusesSchema
>;

export type OnboardingStepType = keyof OnboardingStepStatuses;

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

export type OnboardingStepContent = Record<
  OnboardingStepType,
  OnboardingStepContentDefinition
>;
