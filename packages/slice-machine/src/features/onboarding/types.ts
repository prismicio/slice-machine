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

type OnboardingStepContentDefinition = {
  title?: string;
  content: string | (() => JSX.Element);
  videoUrl: string;
};

export type OnboardingStepContent = Record<
  OnboardingStepType,
  OnboardingStepContentDefinition
>;

export type OnboardingStepStatuses = Record<OnboardingStepType, boolean>;
