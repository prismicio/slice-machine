import { Button, Text } from "@prismicio/editor-ui";
import { ReactNode } from "react";

import { useLocalStorageItem } from "@/hooks/useLocalStorageItem";
import { useRepositoryInformation } from "@/hooks/useRepositoryInformation";

type StepType =
  | "createPage"
  | "codePage"
  | "addSlice"
  | "writeContent"
  | "pushModels";

type Step = {
  id: StepType;
  title: string;
  videoUrl: string;
  description: string | (() => ReactNode);
};

const useSteps = (): Step[] => {
  const { repositoryUrl } = useRepositoryInformation();

  return [
    {
      id: "createPage",
      title: "Add slices to your page type",
      videoUrl:
        "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/ADD_SLICE.mp4",
      description: "Use slice templates and add them to your page type.",
    },
    {
      id: "codePage",
      title: "Code your page",
      videoUrl:
        "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/CODE_SNIP.mp4",
      description:
        "If you don't already have a page component, copy-paste the page snippets provided in your page type to create one.",
    },
    {
      id: "addSlice",
      title: "Push to your Page Builder",
      videoUrl:
        "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/PUSH.mp4",
      description:
        "You have just created some models, but you can't use them yet. First, you must push them to the Page Builder. The Page Builder is where you create content. Go head — push your models.",
    },
    {
      id: "writeContent",
      title: "Create content",
      videoUrl:
        "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/WRITE.mp4",
      description: () => (
        <>
          Open your{" "}
          <Text href={repositoryUrl} underline>
            Page Builder
          </Text>
          , create a page, add slices, save, and publish. Then, come back here.
        </>
      ),
    },
    {
      id: "pushModels",
      title: "Render your page",
      videoUrl:
        "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/PREVIEW.mp4",
      description: () => (
        <>
          To render the page, run your project in your terminal and visit the
          page on localhost (e.g.{" "}
          <Text component="code">localhost:3000/example-page</Text>).
        </>
      ),
    },
  ];
};

type OnboardingState = {
  [K in StepType]: boolean;
};

const initialState: OnboardingState = {
  createPage: false,
  codePage: false,
  addSlice: false,
  writeContent: false,
  pushModels: false,
};

const useOnboardingProgress = () => {
  const steps = useSteps();
  const [stepStatus, setStepStatus] = useLocalStorageItem(
    "onboardingSteps",
    initialState,
  );
  const completedStepCount = Object.values(stepStatus).filter(Boolean).length;

  const toggleStepComplete = (step: StepType) => {
    setStepStatus((prev) => ({ ...prev, [step]: !prev[step] }));
  };

  return { steps, completedStepCount, stepStatus, toggleStepComplete };
};

export const OnboardingGuide = () => {
  const { steps, completedStepCount, stepStatus, toggleStepComplete } =
    useOnboardingProgress();

  const onClick = () => {
    // TODO: remove demonstration code
    const [s] = Object.entries(stepStatus).find((c) => !c[1]) ?? [null, null];
    if (s != null) toggleStepComplete(s as StepType);
  };

  return (
    <div>
      <h3>Welcome</h3>
      <p>Get started in {steps.length} steps</p>
      <p>
        {completedStepCount}/{steps.length}
      </p>
      <Button onClick={onClick}>Continue</Button>
    </div>
  );
};
