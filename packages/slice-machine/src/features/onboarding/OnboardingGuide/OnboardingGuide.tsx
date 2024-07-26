import {
  Card,
  CardContent,
  ProgressBar,
  Text,
  useMediaQuery,
} from "@prismicio/editor-ui";
import clsx from "clsx";
import { confetti as fireConfetti, ConfettiConfig } from "dom-confetti";
import { useRef, useState } from "react";

import { OnboardingProgressStepper } from "@/features/onboarding/OnboardingProgressStepper";
import {
  OnboardingProvider,
  useOnboardingContext,
} from "@/features/onboarding/OnboardingProvider";
import { useOnboardingExperiment } from "@/features/onboarding/useOnboardingExperiment";

import styles from "./OnboardingGuide.module.css";

const OnboardingGuideCard = () => {
  const { steps, completedStepCount, isComplete } = useOnboardingContext();
  const isVisible = useMediaQuery({ min: "medium" });

  if (!isVisible) return null;

  return (
    <div
      className={clsx(
        styles.container,
        isComplete ? styles.invisible : styles.visible,
      )}
    >
      <Card color="grey2" variant="outlined" paddingBlock={16}>
        <CardContent>
          <div>
            <Text variant="bold" color="grey12">
              Build a page in {steps.length} steps
            </Text>
            <Text color="grey11" variant="small">
              Render a live page with content coming from Prismic
            </Text>
          </div>
          <ProgressBar
            value={completedStepCount}
            max={steps.length}
            displayLabel
            getValueLabel={(value, max) => `${value}/${max}`}
          />
          <OnboardingProgressStepper />
        </CardContent>
      </Card>
    </div>
  );
};

const confettiConfig: ConfettiConfig = {
  colors: ["#8E44EC", "#E8C7FF", "#59B5F8", "#C3EEFE"],
  elementCount: 300,
  width: "8px",
  height: "8px",
  stagger: 0.2,
  startVelocity: 35,
  spread: 90,
  duration: 3000,
};

const OnboardingGuideContent = () => {
  const [isVisible, setVisible] = useState(true);
  const confettiCannonRef = useRef<HTMLDivElement>(null);

  const onComplete = () => {
    const { current: confettiCannon } = confettiCannonRef;
    if (confettiCannon) fireConfetti(confettiCannon, confettiConfig);
    setTimeout(() => setVisible(false), confettiConfig.duration);
  };

  if (!isVisible) return null;

  return (
    <OnboardingProvider onComplete={onComplete}>
      <OnboardingGuideCard />
      <div ref={confettiCannonRef} className={styles.confettiCannon} />
    </OnboardingProvider>
  );
};

export const OnboardingGuide = () => {
  const { eligible } = useOnboardingExperiment();

  if (!eligible) return null;

  return <OnboardingGuideContent />;
};
