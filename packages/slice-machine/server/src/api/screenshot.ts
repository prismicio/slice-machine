import type Models from "@slicemachine/core/build/src/models";
import getEnv from "./services/getEnv";
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
  previews: Record<string, Models.Screenshot>;
}> {
  const { env } = await getEnv();
  const [failedPreviews, generatedPreviews] = await Previews.generateForSlice(
    env,
    from,
    sliceName
  );

  let err, reason;
  if (failedPreviews.length) {
    const message = `Could not generate previews for variations: ${failedPreviews
      .map((f) => f.variationId)
      .join(" | ")}`;
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
    previews: Object.entries(mergedPreviews).reduce((acc, [variationId, p]) => {
      if (!p.exists) return acc;
      return {
        ...acc,
        [variationId]: p,
      };
    }, {}),
  };
}
