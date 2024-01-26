import { FC } from "react";
import { Text, Tooltip } from "@prismicio/editor-ui";

import { Syncing } from "@src/icons/Syncing";
import { Synced } from "@src/icons/Synced";
import { SyncFailed } from "@src/icons/SyncFailed";

import styles from "./AutoSyncStatusIndicator.module.css";

type AutoSyncStatusIndicatorProps = {
  autoSyncStatus: "syncing" | "synced" | "failed";
};

export const AutoSyncStatusIndicator: FC<AutoSyncStatusIndicatorProps> = (
  props,
) => {
  const { autoSyncStatus } = props;

  let autoSaveStatusInfo;

  console.log("autoSyncStatus:", autoSyncStatus);

  switch (autoSyncStatus) {
    case "syncing":
      autoSaveStatusInfo = {
        icon: <Syncing />,
        text: "Syncing...",
        tooltipText:
          "Slice Machine is attempting to sync your changes with your Personal Sandbox.",
      };
      break;
    case "synced":
      autoSaveStatusInfo = {
        icon: <Synced />,
        text: "In sync",
        tooltipText: "All your changes are synced with your Personal Sandbox.",
      };
      break;
    case "failed":
      autoSaveStatusInfo = {
        icon: <SyncFailed />,
        text: "Sync failed",
        tooltipText:
          "An error occurred while syncing your changes with your Personal Sandbox.",
      };
      break;
  }

  return autoSaveStatusInfo.tooltipText !== undefined ? (
    <Tooltip content={autoSaveStatusInfo.tooltipText} side="bottom">
      <div className={styles.root}>
        {autoSaveStatusInfo.icon}
        <Text color="grey11">{autoSaveStatusInfo.text}</Text>
      </div>
    </Tooltip>
  ) : (
    autoSaveStatusInfo.icon
  );
};
