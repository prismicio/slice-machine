import { OnboardingGuide } from "@prismicio/editor-fields";

import { telemetry } from "@/apiClient";
import { SideNavButton, SideNavListItem } from "@/components/SideNav";
import { PlayCircleIcon } from "@/icons/PlayCircleIcon";

import { useOnboarding } from "./useOnboarding";

export function SharedOnboardingGuide() {
  const { onboarding, toggleStep, toggleGuide } = useOnboarding();

  if (!onboarding) return null;

  if (onboarding.isDismissed) {
    return (
      <SideNavListItem>
        <SideNavButton
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
      onboardingState={{
        ...onboarding,
        context: { ...onboarding.context, framework: "next" },
      }}
      onToggleStep={toggleStep}
      onToggleGuide={toggleGuide}
    />
  );
}
