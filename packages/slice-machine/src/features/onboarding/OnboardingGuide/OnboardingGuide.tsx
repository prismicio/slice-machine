import {
  Card,
  CardContent,
  ProgressBar,
  Text,
  useMediaQuery,
} from "@prismicio/editor-ui";
import { confetti as fireConfetti, ConfettiConfig } from "dom-confetti";
import { useRef, useState } from "react";

import { OnboardingProgressStepper } from "@/features/onboarding/OnboardingProgressStepper";
import {
  OnboardingProvider,
  useOnboardingContext,
} from "@/features/onboarding/OnboardingProvider";
import { useOnboardingCardVisibilityExperiment } from "@/features/onboarding/useOnboardingCardVisibilityExperiment";
import { useOnboardingExperiment } from "@/features/onboarding/useOnboardingExperiment";
import { useUpdateAvailable } from "@/hooks/useUpdateAvailable";

import styles from "./OnboardingGuide.module.css";

export function OnboardingGuide() {
  const { eligible } = useOnboardingExperiment();
  const { sliceMachineUpdateAvailable, adapterUpdateAvailable } =
    useUpdateAvailable();

  if (!eligible || sliceMachineUpdateAvailable || adapterUpdateAvailable) {
    return null;
  }

  return <OnboardingGuideContent />;
}

function OnboardingGuideContent() {
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
  const { eligible: isOnboardingCardVisibilityExperiment, variant } =
    useOnboardingCardVisibilityExperiment();

  const {
    cardColor,
    cardVariant,
    cardDescription,
    cardTitle,
    descriptionColor,
    descriptionVariant,
    progressColor,
    progressBackgroundColor,
    progressLabelColor,
    titleColor,
  } = getCardPropsFromExperimentVariant(variant);

  if (!isVisible) return null;

  return (
    <div
      className={isComplete ? styles.invisible : styles.visible}
      // 1px padding to avoid cliping of animated card while it scales up
      style={{ padding: isOnboardingCardVisibilityExperiment ? 1 : 0 }}
    >
      <Card color={cardColor} variant={cardVariant} paddingBlock={16}>
        <CardContent>
          <div>
            <Text variant="bold" color={titleColor}>
              {cardTitle.replace("{number}", steps.length.toString())}
            </Text>
            <Text color={descriptionColor} variant={descriptionVariant}>
              {cardDescription}
            </Text>
          </div>
          <ProgressBar
            color={progressColor}
            progressTrackColor={progressBackgroundColor}
            labelColor={progressLabelColor}
            value={completedStepCount}
            max={steps.length}
            displayLabel
            getValueLabel={(value, max) => `${value}/${max}`}
          />
          <OnboardingProgressStepper
            hasLargeButton={isOnboardingCardVisibilityExperiment}
          />
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

interface CardProps {
  cardColor?: "grey2";
  cardVariant?: "outlined" | "animated-light" | "animated-dark";
  cardTitle: string;
  cardDescription: string;
  titleColor?: "grey12" | "purple1";
  descriptionColor?: "grey11" | "purple6";
  descriptionVariant?: "small";
  progressColor?: "white";
  progressBackgroundColor?: "purple8";
  progressLabelColor?: "purple3";
}

const getCardPropsFromExperimentVariant = (variant?: string): CardProps => {
  switch (variant) {
    case "light":
      return {
        cardDescription:
          "Render a live page with content coming from Prismic in 5 mins",
        cardTitle: "Build your first Prismic Page in {number} simple steps",
        cardVariant: "animated-light",
        descriptionColor: "grey11",
        titleColor: "grey12",
      };
    case "dark":
      return {
        cardDescription:
          "Render a live page with content coming from Prismic in 5 mins",
        cardTitle: "Build your first Prismic Page in {number} simple steps",
        cardVariant: "animated-dark",
        descriptionColor: "purple6",
        progressColor: "white",
        progressBackgroundColor: "purple8",
        progressLabelColor: "purple3",
        titleColor: "purple1",
      };
    default:
      return {
        cardColor: "grey2",
        cardVariant: "outlined",
        cardTitle: "Build a page in {number} steps",
        cardDescription: "Render a live page with content coming from Prismic",
        descriptionColor: "grey11",
        descriptionVariant: "small",
        titleColor: "grey12",
      };
  }
};
