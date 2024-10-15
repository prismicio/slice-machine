import {
  Card,
  CardContent,
  ProgressBar,
  Text,
  useMediaQuery,
} from "@prismicio/editor-ui";
import { confetti as fireConfetti, ConfettiConfig } from "dom-confetti";
import { useRef, useState } from "react";

import styles from "./OnboardingGuide.module.css";
import { OnboardingProgressStepper } from "./OnboardingProgressStepper";
import { OnboardingProvider, useOnboardingContext } from "./OnboardingProvider";
import { OnboardingTutorial } from "./OnboardingTutorial/OnboardingTutorial";

// TODO: Replace confetti with editor-support useConfetti when it's released
export function SliceMachineOnboardingGuide() {
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
      <div className={styles.container}>
        <OnboardingGuideCard />
        <div ref={confettiCannonRef} className={styles.confettiCannon} />
      </div>
    </OnboardingProvider>
  );
}

function OnboardingGuideCard() {
  const { steps, completedStepCount, isComplete } = useOnboardingContext();
  const isVisible = useMediaQuery({ min: "medium" });

  if (!isVisible) return null;

  return (
    <div
      className={isComplete ? styles.invisible : styles.visible}
      // 1px padding to avoid cliping of animated card while it scales up
      style={{ padding: 1 }}
    >
      <Card variant="animated-light" paddingBlock={16}>
        <CardContent>
          <div>
            <Text variant="bold" color="grey12">
              {`Build your first Prismic Page in ${steps.length.toString()} simple steps`}
            </Text>
            <Text color="grey11">
              Render a live page with content coming from Prismic in 5 mins
            </Text>
          </div>
          <ProgressBar
            value={completedStepCount}
            max={steps.length}
            displayLabel
            getValueLabel={(value, max) => `${value}/${max}`}
          />
          <OnboardingProgressStepper buttonSize="large" />
          <OnboardingTutorial />
        </CardContent>
      </Card>
    </div>
  );
}

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
