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
  description: string;
};

export type OnboardingStepStatuses = {
  [K in OnboardingStepType]: boolean;
};

const steps: OnboardingStep[] = [
  {
    id: "createPage",
    title: "Create Your Page",
    description: "Setup a new page.",
  },
  {
    id: "codePage",
    title: "Code your page",
    description: "Build your page's structure",
  },
  {
    id: "addSlice",
    title: "Add a Slice",
    description: "Insert reusable sections.",
  },
  {
    id: "pushModels",
    title: "Push Your Models",
    description: "Deploy your models.",
  },
  {
    id: "writeContent",
    title: "Write Content",
    description: "Add engaging content.",
  },
];

export type OnboardingStepContent = {
  [K in OnboardingStepType]: {
    title?: string;
    description: string | (() => ReactNode);
    videoUrl: string;
  };
};

export const useOnboardingStepsContent = (): OnboardingStepContent => {
  const { repositoryUrl } = useRepositoryInformation();

  return {
    createPage: {
      videoUrl:
        "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/ADD_SLICE.mp4",
      description:
        "Commodo irure ipsum exercitation consequat enim velit amet commodo. Excepteur proident Lorem sunt enim amet tempor qui Lorem non non Lorem. Ex sint elit ea. Proident veniam dolor cupidatat amet aute consectetur. Non ad consectetur irure adipisicing aliquip. Ipsum nulla velit mollit magna aliqua eu veniam. Commodo elit labore veniam nulla dolor aliqua esse proident pariatur nostrud.",
    },
    codePage: {
      videoUrl:
        "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/CODE_SNIP.mp4",
      description:
        "Nulla consequat occaecat ut ut ex culpa veniam sunt nisi nisi. Velit excepteur excepteur do anim incididunt in cillum ullamco occaecat minim reprehenderit eu enim. Nulla irure est fugiat aliqua elit excepteur labore ipsum occaecat eu minim duis non sit. Ea eu irure dolore duis labore ad. Quis sunt eu commodo sit nisi ullamco qui aliqua nostrud labore nostrud ut nostrud nostrud.",
    },
    addSlice: {
      videoUrl:
        "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/PUSH.mp4",
      description:
        "Minim anim velit laboris cupidatat cupidatat culpa labore sunt eiusmod. Consequat culpa mollit enim dolore aliquip ex voluptate ex eiusmod incididunt eu. Cillum magna cillum magna consectetur. Id aliquip excepteur adipisicing officia excepteur et pariatur aliquip aliquip laborum.",
    },
    pushModels: {
      videoUrl:
        "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/PREVIEW.mp4",
      description:
        "Ipsum aliqua do consequat eiusmod id. Reprehenderit consectetur sit officia consequat velit non officia aliquip laboris incididunt cillum proident incididunt. Ad quis laborum tempor dolor duis ea cillum aliqua occaecat. Sunt reprehenderit fugiat et ullamco proident pariatur deserunt minim. Irure enim nulla et ad ut id anim elit. Voluptate culpa esse qui et reprehenderit aute est.",
    },
    writeContent: {
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
  };
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
  const [status, setStatus, { isUnset: isStatusUnset }] =
    useLocalStorageItem<OnboardingStepStatuses>(
      "onboardingSteps",
      initialState,
    );

  useEffect(() => {
    // populate onboarding status if not defined
    if (isStatusUnset) setStatus(initialState);

    /* eslint-disable-next-line react-hooks/exhaustive-deps -- 
    We don't care if the values of isStatusUnset, setStatus or initialState change here. */
  }, [status]);

  return [status, setStatus];
};

export const useOnboardingProgress = () => {
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
