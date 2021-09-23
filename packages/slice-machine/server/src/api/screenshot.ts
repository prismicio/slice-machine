import { getEnv } from "@lib/env";
import { Preview } from "@lib/models/common/Component";
import Previews from "./previews";

export default async function handler({
  from,
  sliceName,
}: {
  from: string;
  sliceName: string;
}): Promise<{
  err: Error | undefined;
  reason: string | undefined;
  previews: ReadonlyArray<Preview>;
}> {
  const { env } = await getEnv();
  const generatedPreviews = await Previews.generateForSlice(
    env,
    from,
    sliceName
  );
  const failedPreviewsIds = generatedPreviews
    .filter((p) => !p.hasPreview)
    .map((p) => p.variationId);

  let err, reason;
  if (failedPreviewsIds?.length) {
    const message = `Could not generate previews for variations: ${failedPreviewsIds.join(
      " | "
    )}`;
    err = new Error(message);
    reason = message;
  }

  const mergedPreviews = Previews.mergeWithCustomScreenshots(
    generatedPreviews,
    env,
    from,
    sliceName
  );

  return {
    err,
    reason,
    previews: mergedPreviews.filter((p) => p.hasPreview) as ReadonlyArray<
      Preview
    >,
  };
}
