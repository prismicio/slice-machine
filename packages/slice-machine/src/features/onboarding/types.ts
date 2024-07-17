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

export type OnboardingStepContent = Record<
  OnboardingStepType,
  OnboardingStepContentDefinition
>;

export type OnboardingStepStatuses = Record<OnboardingStepType, boolean>;
