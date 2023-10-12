import type { FC } from "react";
import { Box, Text } from "@prismicio/editor-ui";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { ToasterType } from "@src/modules/toaster";

import { LabsListItem } from "./LabsListItem";
import { type UseLabArgs, type UseLabReturnType, useLab } from "./useLab";

export const LabsList: FC = () => {
  const [legacySliceUpgraderLab, setLegacySliceUpgraderLab] = useLabWithToast(
    "legacySliceUpgrader",
    "Legacy Slice Upgrader"
  );

  return (
    <Box flexDirection="column" gap={32}>
      <header>
        <Text variant="normal">
          Slice Machine Labs gives you early access to new features before
          they're available to everyone.
        </Text>
        <Text variant="normal">
          Experimental features are works-in-progress and unstable, so you may
          find some bugs along the way.
        </Text>
      </header>
      <Box flexDirection="column" gap={16}>
        <LabsListItem
          title="Legacy Slice Upgrader"
          enabled={legacySliceUpgraderLab.enabled}
          onToggle={(enabled) => void setLegacySliceUpgraderLab(enabled)}
        >
          The Legacy Slice Upgrader allows you to convert old slices (legacy and
          composite slices) to slices managed by Slice Machine (shared slices).
          This feature is experimental, we strongly encourage you testing it
          through a Prismic environment first or you'll be at risk of losing
          past content.
        </LabsListItem>
      </Box>
    </Box>
  );
};

function useLabWithToast(key: UseLabArgs, name: string): UseLabReturnType {
  const { openToaster } = useSliceMachineActions();
  const [lab, setLab] = useLab(key);

  const setLabWithToast = async (enabled: boolean) => {
    try {
      await setLab(enabled);

      openToaster(
        enabled ? `Labs: enabled ${name}` : `Labs: disabled ${name}`,
        ToasterType.SUCCESS
      );
    } catch (error) {
      console.error(error);

      openToaster(
        enabled
          ? `Labs: failed to enable ${name}`
          : `Labs: failed to disable ${name}`,
        ToasterType.ERROR
      );
    }
  };

  return [lab, setLabWithToast];
}
