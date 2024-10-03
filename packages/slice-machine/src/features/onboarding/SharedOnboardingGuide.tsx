import { OnboardingGuide } from "@prismicio/editor-fields";
import { useMediaQuery } from "@prismicio/editor-ui";

import { telemetry } from "@/apiClient";

import { useOnboarding } from "./useOnboarding";

export function SharedOnboardingGuide() {
  const isOnboardingVisible = useMediaQuery({ min: "medium" });

  const { onboarding, toggleStep, toggleGuide } = useOnboarding();

  if (!onboarding || !isOnboardingVisible) return null;

  return (
    <OnboardingGuide
      tracking={{
        track: telemetry.track,
        source: "SliceMachine",
      }}
      onboardingState={onboarding}
      onToggleStep={toggleStep}
      onToggleGuide={toggleGuide}
    />
  );
}
