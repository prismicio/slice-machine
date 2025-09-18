/**
 * Local storage keys used in the app (incomplete for now, so you still have to be careful when picking one).
 * Do not remove old keys that become unused in newer versions.
 * Always prefix keys with `slice-machine_` to avoid conflicts with other libraries and have them grouped together in the local storage.
 */

const withPrefix = (key: string) => `slice-machine_${key}`;

export const staticFieldsInfoDialogDismissedKey = withPrefix(
  "staticFieldsInfoDialogDismissed",
);

export function getAiFeedbackKey({
  type,
  library,
  sliceId,
  variationId,
}: {
  type: "model";
  library: string;
  sliceId: string;
  variationId: string;
}) {
  return withPrefix(
    ["ai-feedback", type, library, sliceId, variationId].join("#"),
  );
}

export const infoBannerKey = withPrefix("info-banner");
