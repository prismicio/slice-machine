import { Text } from "@prismicio/editor-ui";

import type {
  OnboardingStep,
  OnboardingStepContentDefinition,
  OnboardingStepType,
} from "@/features/onboarding/types";

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "addSlice",
    title: "Add Slices",
    description: "Add slices to your page type.",
  },
  {
    id: "codePage",
    title: "Code your page",
    description: "Build your page's structure",
  },
  {
    id: "pushModels",
    title: "Push Your Page",
    description: "Push to your Page Builder.",
  },
  {
    id: "createContent",
    title: "Create content",
    description: "Create engaging content.",
  },
  {
    id: "renderPage",
    title: "Render your page",
    description: "Render your page on localhost.",
  },
];

type GetOnboardingStepsContentProps = {
  repositoryUrl: string;
};

export const getOnboardingStepsContent = ({
  repositoryUrl,
}: GetOnboardingStepsContentProps): Record<
  OnboardingStepType,
  OnboardingStepContentDefinition
> => ({
  addSlice: {
    videoUrl:
      "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/ADD_SLICE.mp4",
    content: () => (
      <Text>Use slice templates and add them to your page type.</Text>
    ),
  },
  codePage: {
    videoUrl:
      "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/CODE_SNIP.mp4",
    content: () => (
      <Text>
        If you don't already have a page component, copy-paste the page snippets
        provided in your page type to create one.
      </Text>
    ),
  },
  pushModels: {
    videoUrl:
      "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/PUSH.mp4",
    content: () => (
      <Text>
        You have just created some models, but you can't use them yet. First,
        you must push them to the Page Builder. The Page Builder is where you
        create content. Go head — push your models.
      </Text>
    ),
  },
  createContent: {
    videoUrl:
      "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/PREVIEW.mp4",
    content: () => (
      <Text>
        Open your{" "}
        <Text href={repositoryUrl} underline>
          Page Builder
        </Text>
        , create a page, add slices, save, and publish. Then, come back here.
      </Text>
    ),
  },
  renderPage: {
    videoUrl:
      "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/WRITE.mp4",
    content: () => (
      <Text>
        To render the page, run your project in your terminal and visit the page
        on localhost (e.g.{" "}
        <Text component="code">localhost:3000/example-page</Text>).
      </Text>
    ),
  },
});
