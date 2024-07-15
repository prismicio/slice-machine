import { Text } from "@prismicio/editor-ui";
import { Dispatch, ReactNode, SetStateAction, useEffect, useRef } from "react";

import { useLocalStorageItem } from "@/hooks/useLocalStorageItem";
import { useRepositoryInformation } from "@/hooks/useRepositoryInformation";

export type OnboardingStepType =
  | "createPage"
  | "codePage"
  | "addSlice"
  | "writeContent"
  | "pushModels";

export type OnboardingStep = {
  id: OnboardingStepType;
  title: string;
  videoUrl: string;
  description: string | (() => ReactNode);
};

export type OnboardingStepStatuses = {
  [K in OnboardingStepType]: boolean;
};

const useOnboardingStepsContent = (): OnboardingStep[] => {
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
        <span>
          Open your{" "}
          <Text href={repositoryUrl} underline>
            Page Builder
          </Text>
          , create a page, add slices, save, and publish. Then, come back here.
        </span>
      ),
    },
    {
      id: "pushModels",
      title: "Render your page",
      videoUrl:
        "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/PREVIEW.mp4",
      description: () => (
        <span>
          To render the page, run your project in your terminal and visit the
          page on localhost (e.g.{" "}
          <Text component="code">localhost:3000/example-page</Text>).
        </span>
      ),
    },
  ];
};

const getInitialState = (): OnboardingStepStatuses => {
  // if the old guide was dismissed, all steps start as complete
  const startComplete =
    localStorage.getItem("slice-machine_isInAppGuideOpen") === "false";

  return {
    createPage: startComplete,
    codePage: startComplete,
    addSlice: startComplete,
    writeContent: startComplete,
    pushModels: startComplete,
  };
};

const useOnboardingStepStatus = (): [
  OnboardingStepStatuses,
  Dispatch<SetStateAction<OnboardingStepStatuses>>,
] => {
  const initialState = useRef(getInitialState()).current;
  const [status, setStatus, { wasUnset: wasStatusUnset }] = useLocalStorageItem(
    "onboardingSteps",
    initialState,
  );

  useEffect(() => {
    // populate onboarding status if not defined
    if (wasStatusUnset) setStatus(initialState);

    /* eslint-disable-next-line react-hooks/exhaustive-deps -- 
    We don't care if the values of wasStatusUnset, setStatus or initialState change here. */
  }, [status]);

  return [status, setStatus];
};

export const useOnboardingProgress = () => {
  const steps = useOnboardingStepsContent();
  const [stepStatus, setStepStatus] = useOnboardingStepStatus();
  const completedStepCount = Object.values(stepStatus).filter(Boolean).length;

  const toggleStepComplete = (step: OnboardingStepType) => {
    setStepStatus((prev) => ({ ...prev, [step]: !prev[step] }));
  };

  const getStepIndex = (stepOrId: OnboardingStep | OnboardingStepType) => {
    return steps.findIndex(({ id }) => {
      return id === (typeof stepOrId === "string" ? stepOrId : stepOrId.id);
    });
  };

  const isStepComplete = (stepOrId: OnboardingStep | OnboardingStepType) => {
    return (
      stepStatus[typeof stepOrId === "string" ? stepOrId : stepOrId.id] ?? false
    );
  };

  return {
    steps,
    getStepIndex,
    isStepComplete,
    completedStepCount,
    toggleStepComplete,
    isComplete: completedStepCount === steps.length,
  };
};
