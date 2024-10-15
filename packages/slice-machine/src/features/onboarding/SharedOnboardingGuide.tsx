import { OnboardingGuide } from "@prismicio/editor-fields";

import { telemetry } from "@/apiClient";

import { useOnboarding } from "./useOnboarding";

export function SharedOnboardingGuide() {
  const { onboarding, toggleStep, toggleGuide } = useOnboarding();

  if (!onboarding) return null;

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
