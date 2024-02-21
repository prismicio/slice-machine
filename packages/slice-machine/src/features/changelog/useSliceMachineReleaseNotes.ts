import { useRequest } from "@prismicio/editor-support/Suspense";

import { managerClient } from "@src/managerClient";

async function getSliceMachineReleaseNotes(version: string) {
  const latestNonBreakingVersion =
    await managerClient.versions.getSliceMachineReleaseNotesForVersion({
      version,
    });

  return latestNonBreakingVersion;
}

export function useSliceMachineReleaseNotes(version: string) {
  return useRequest(getSliceMachineReleaseNotes, [version]);
}
