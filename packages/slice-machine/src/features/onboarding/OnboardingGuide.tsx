import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Icon,
  ScrollArea,
  Text,
  Video,
} from "@prismicio/editor-ui";
import { ReactNode, useState } from "react";

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

type OnboardingStepDialogProps = {
  step: Step | undefined;
  onClose: () => void;
};

export const OnboardingStepDialog = ({
  step,
  onClose,
}: OnboardingStepDialogProps) => {
  const { toggleStepComplete, stepStatus, steps } = useOnboardingProgress();

  if (!step) return null;

  const markAsDone = () => {
    toggleStepComplete(step.id);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogHeader title={step.title} />
      <DialogContent>
        <ScrollArea>
          <Text color="purple9" variant="bold">
            Step {steps.findIndex(({ id }) => id === step.id) + 1}
          </Text>
          {typeof step.description === "string" ? (
            <Text>{step.description}</Text>
          ) : (
            <step.description />
          )}
          <Video src={step.videoUrl} sizing="contain" autoPlay loop />
        </ScrollArea>
        <DialogActions
          ok={{
            text: stepStatus[step.id] ? "Undo step" : "Mark as done",
            onClick: markAsDone,
          }}
          cancel={{ text: "Close" }}
        />
      </DialogContent>
    </Dialog>
  );
};

const OnboardingProgressMenu = () => {
  const [activeStep, setActiveStep] = useState<Step>();
  const { completedStepCount, steps, stepStatus } = useOnboardingProgress();

  return (
    <>
      <OnboardingStepDialog
        step={activeStep}
        onClose={() => setActiveStep(undefined)}
      />
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button>{completedStepCount > 0 ? "Continue" : "Start"}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Progress</DropdownMenuLabel>
          {steps.map((step) => {
            const isCompleted = stepStatus[step.id];

            return (
              <DropdownMenuItem
                key={step.id}
                onSelect={() => setActiveStep(step)}
                startIcon={
                  <Icon
                    color={isCompleted ? "green10" : "currentColor"}
                    name={isCompleted ? "checkBox" : "checkBoxOutlinedBlank"}
                  />
                }
              >
                {step.title}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const OnboardingGuide = () => {
  const { steps, completedStepCount } = useOnboardingProgress();

  return (
    <div>
      <h3>Welcome</h3>
      <p>Get started in {steps.length} steps</p>
      <p>
        {completedStepCount}/{steps.length}
      </p>
      <OnboardingProgressMenu />
    </div>
  );
};
