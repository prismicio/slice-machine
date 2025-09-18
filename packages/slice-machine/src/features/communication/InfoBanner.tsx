import {
  Banner,
  BannerButton,
  BannerDescription,
  BannerTitle,
} from "@prismicio/editor-ui";
import Link from "next/link";
import { z } from "zod";

import { telemetry } from "@/apiClient";
import { useExperimentVariant } from "@/hooks/useExperimentVariant";
import { usePersistedState } from "@/hooks/usePersistedState";
import { infoBannerKey } from "@/utils/localStorageKeys";

export function InfoBanner() {
  const [dismissedBanners, setDismissedBanners] = usePersistedState(
    infoBannerKey,
    [],
    { schema: InfoBannerStorageValue },
  );
  const infoBannerFeatureFlag = useExperimentVariant(
    "slicemachine-info-banner",
  );

  const infoBannerId = infoBannerFeatureFlag?.value;

  // Early return if info banner feature flag value is not set
  if (infoBannerId === undefined) {
    return null;
  }

  const infoBannerPayload = InfoBannerPayload.safeParse(
    infoBannerFeatureFlag?.payload,
  );

  // Early return if Amplitude feature flag payload is invalid
  if (!infoBannerPayload.success) {
    return null;
  }

  const { title, description, buttonLabel, buttonLink, color } =
    infoBannerPayload.data;

  // Early return if info banner has already been dismissed
  if (dismissedBanners.includes(infoBannerId)) {
    return null;
  }

  const onClose = () => {
    setDismissedBanners((prev) => [...prev, infoBannerId]);
    void telemetry.track({
      event: "info-banner:dismissed",
      infoBannerId,
    });
  };

  const onButtonClick = () => {
    void telemetry.track({
      event: "info-banner:button-clicked",
      infoBannerId,
    });
  };

  return (
    <Banner color={color} onClose={onClose}>
      <BannerTitle>{title}</BannerTitle>
      <BannerDescription>{description}</BannerDescription>
      <BannerButton asChild>
        {buttonLink !== undefined && buttonLabel !== undefined && (
          <Link href={buttonLink} target="_blank" onClick={onButtonClick}>
            {buttonLabel}
          </Link>
        )}
      </BannerButton>
    </Banner>
  );
}

const InfoBannerPayload = z.object({
  title: z.string(),
  description: z.string(),
  buttonLabel: z.string().optional(),
  buttonLink: z.string().optional(),
  color: z.enum(["info", "warn", "error"]).default("info"),
});
type InfoBannerPayload = z.infer<typeof InfoBannerPayload>;

const InfoBannerStorageValue = z.array(z.string());
type InfoBannerStorageValue = z.infer<typeof InfoBannerStorageValue>;
