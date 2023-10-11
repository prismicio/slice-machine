import { type FC } from "react";
import { Box, Text } from "@prismicio/editor-ui";

import type { SliceMachineConfig } from "@slicemachine/manager";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { ToasterType } from "@src/modules/toaster";
import {
  useSliceMachineConfig,
  writeSliceMachineConfig,
} from "@src/hooks/useSliceMachineConfig";

import { LabsListItem } from "./LabsListItem";

export const LabsList: FC = () => {
  const config = useSliceMachineConfig();
  const { openToaster } = useSliceMachineActions();

  const setLab = async (
    key: keyof Required<SliceMachineConfig>["labs"],
    name: string,
    enabled: boolean
  ) => {
    const updatedConfig = { ...config, labs: { ...config.labs } };

    if (enabled) {
      updatedConfig.labs[key] = enabled;
    } else if (key in updatedConfig.labs) {
      delete updatedConfig.labs[key];
    }

    if (Object.keys(updatedConfig.labs).length === 0) {
      delete (updatedConfig as SliceMachineConfig).labs;
    }

    try {
      await writeSliceMachineConfig(updatedConfig);

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
          enabled={config.labs?.legacySliceUpgrader ?? false}
          onToggle={(enabled) =>
            void setLab("legacySliceUpgrader", "Legacy Slice Upgrader", enabled)
          }
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
