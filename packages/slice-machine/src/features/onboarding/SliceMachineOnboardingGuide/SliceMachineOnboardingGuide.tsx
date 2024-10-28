import { useConfetti } from "@prismicio/editor-support/Animation";
import {
  Card,
  CardContent,
  ProgressBar,
  Text,
  useMediaQuery,
} from "@prismicio/editor-ui";
import { useEffect, useRef, useState } from "react";

import styles from "./OnboardingGuide.module.css";
import { OnboardingProgressStepper } from "./OnboardingProgressStepper";
import { OnboardingProvider, useOnboardingContext } from "./OnboardingProvider";
import { OnboardingTutorial } from "./OnboardingTutorial/OnboardingTutorial";

export function SliceMachineOnboardingGuide() {
  const [isVisible, setVisible] = useState(true);
  const confetti = useConfetti({ onAnimationEnd: () => setVisible(false) });

  if (!isVisible) return null;

  return (
    <OnboardingProvider onComplete={confetti.throwConfetti}>
      <div ref={confetti.confettiContainerRef} className={styles.container}>
        <OnboardingGuideCard setVisible={setVisible} />
        <div
          ref={confetti.confettiCannonRef}
          className={styles.confettiCannon}
        />
      </div>
    </OnboardingProvider>
  );
}

type OnboardingGuideCardProps = {
  setVisible: (isVisible: boolean) => void;
};

function OnboardingGuideCard(props: OnboardingGuideCardProps) {
  const { setVisible } = props;
  const { steps, completedStepCount, isComplete } = useOnboardingContext();
  const isVisible = useMediaQuery({ min: "medium" });

  const isMountedRef = useRef(false);
  useEffect(() => {
    // quick fix to prevent having the onboarding invisible but interactive when complete
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      setVisible(false);
    }
  }, [isVisible, setVisible]);

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
