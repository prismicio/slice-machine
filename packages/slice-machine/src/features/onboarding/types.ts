import { z } from "zod";

export const onboardingStepStatusesSchema = z.object({
  createProject: z.literal(true),
  createPageType: z.boolean(),
  codePage: z.boolean(),
  createSlice: z.boolean(),
  reviewAndPush: z.boolean(),
  createContent: z.boolean(),
  renderPage: z.boolean(),
});

export type OnboardingStepStatuses = z.infer<
  typeof onboardingStepStatusesSchema
>;

export type OnboardingStepId = keyof OnboardingStepStatuses;

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  description: string;
  content?: () => JSX.Element;
  videoUrl?: string;
  readonly?: boolean;
}
