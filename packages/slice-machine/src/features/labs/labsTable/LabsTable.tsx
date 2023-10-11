import { type FC } from "react";
import { Box, Text } from "@prismicio/editor-ui";

import type { SliceMachineConfig } from "@slicemachine/manager";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { ToasterType } from "@src/modules/toaster";
import {
  useSliceMachineConfig,
  writeSliceMachineConfig,
} from "@src/hooks/useSliceMachineConfig";

import { LabsTableItem } from "./LabsTableItem";

export const LabsTable: FC = () => {
  const config = useSliceMachineConfig();
  const { openToaster } = useSliceMachineActions();

  const setLab = (
    key: keyof Required<SliceMachineConfig>["labs"],
    name: string
  ) => {
    return async (enabled: boolean) => {
      try {
        const updatedConfig = {
          ...config,
          labs: { ...config.labs },
        };

        if (enabled) {
          updatedConfig.labs[key] = enabled;
        } else if (key in updatedConfig.labs) {
          delete updatedConfig.labs[key];
        }

        if (Object.keys(updatedConfig.labs).length === 0) {
          delete (updatedConfig as SliceMachineConfig).labs;
        }

        await writeSliceMachineConfig({ config: updatedConfig });
      } catch (error) {
        console.error(error);

        openToaster(
          enabled
            ? `Labs: failed to enable ${name}`
            : `Labs: failed to disable ${name}`,
          ToasterType.ERROR
        );

        return;
      }

      openToaster(
        enabled ? `Labs: enabled ${name}` : `Labs: disabled ${name}`,
        ToasterType.SUCCESS
      );
    };
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
        <LabsTableItem
          title="Legacy Slice Upgrader"
          enabled={config.labs?.legacySliceUpgrader ?? false}
          onToggle={setLab("legacySliceUpgrader", "Legacy Slice Upgrader")}
          tags={["Unstable", "Content Modeling", "Slice", "Page Builder"]}
        >
          The Legacy Slice Upgrader allows you to convert old slices (legacy and
          composite slices) to slices managed by Slice Machine (shared slices).
          This feature is experimental, we strongly encourage you testing it
          through a Prismic environments first or you'll be at risk of losing
          past content.
        </LabsTableItem>
      </Box>
    </Box>
  );
};
