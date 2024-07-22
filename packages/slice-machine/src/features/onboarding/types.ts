import { z } from "zod";

export const onboardingStepStatusesSchema = z.object({
  addSlice: z.boolean(),
  codePage: z.boolean(),
  pushModels: z.boolean(),
  createContent: z.boolean(),
  renderPage: z.boolean(),
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
