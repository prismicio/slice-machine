import { OnboardingGuide } from "@prismicio/editor-fields";

import { telemetry } from "@/apiClient";
import { SideNavCta, SideNavListItem } from "@/components/SideNav";
import { PlayCircleIcon } from "@/icons/PlayCircleIcon";

import { useOnboarding } from "./useOnboarding";

export function SharedOnboardingGuide() {
  const { onboarding, toggleStep, toggleGuide } = useOnboarding();

  if (!onboarding) return null;

  if (onboarding.isDismissed) {
    return (
      <SideNavListItem>
        <SideNavCta
          component="button"
          title="Get Started"
          Icon={PlayCircleIcon}
          onClick={() => void toggleGuide()}
        />
      </SideNavListItem>
    );
  }

  return (
    <OnboardingGuide
      tracking={{
        track: (args) => telemetry.track({ ...args, source: "SliceMachine" }),
        source: "SliceMachine",
      }}
      onboardingState={onboarding}
      onToggleStep={toggleStep}
      onToggleGuide={toggleGuide}
    />
  );
}
