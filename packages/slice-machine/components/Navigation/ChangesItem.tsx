import { type FC } from "react";
import { useRouter } from "next/router";
import { Box, Button, Text } from "@prismicio/editor-ui";

import {
  HoverCard,
  HoverCardCloseButton,
  HoverCardDescription,
  HoverCardMedia,
  HoverCardTitle,
} from "@src/components/HoverCard";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useNetwork } from "@src/hooks/useNetwork";
import { useAuthStatus } from "@src/hooks/useAuthStatus";
import { useUnSyncChanges } from "@src/features/sync/useUnSyncChanges";
import { AuthStatus } from "@src/modules/userContext/types";
import { useAutoSync } from "@src/features/sync/AutoSyncProvider";
import { AutoSyncStatusIndicator } from "@src/features/sync/components/AutoSyncStatusIndicator";

export const ChangesItem: FC = () => {
  const { setSeenChangesToolTip } = useSliceMachineActions();
  const open = useOpenChangesHoverCard();
  const router = useRouter();
  const { autoSyncStatus } = useAutoSync();

  const onClose = () => {
    setSeenChangesToolTip();
  };

  return (
    <HoverCard
      open={open}
      openDelay={3000}
      onClose={onClose}
      side="right"
      sideOffset={24}
      collisionPadding={280}
      trigger={
        <Box padding={{ bottom: 24 }}>
          {autoSyncStatus === "failed" ||
          autoSyncStatus === "synced" ||
          autoSyncStatus === "syncing" ? (
            <AutoSyncStatusIndicator autoSyncStatus={autoSyncStatus} />
          ) : (
            // TODO(DT-1942): This should be a Button with a link component for
            // accessibility
            <Button
              color="grey"
              onClick={() => {
                void router.push("/changes");
              }}
              sx={{ width: "100%" }}
            >
              <Box alignItems="center" gap={4}>
                <Text variant="bold">Review changes</Text> <ChangesCount />
              </Box>
            </Button>
          )}
        </Box>
      }
    >
      <HoverCardTitle>Push your changes</HoverCardTitle>
      <HoverCardMedia component="image" src="/push.png" />
      <HoverCardDescription>
        When you click Save, your changes are saved locally. Then, you can push
        your models to Prismic from the Changes page.
      </HoverCardDescription>
      <HoverCardCloseButton>Got it</HoverCardCloseButton>
    </HoverCard>
  );
};

export const ChangesCount: FC = () => {
  const isOnline = useNetwork();
  const authStatus = useAuthStatus();
  const { unSyncedSlices, unSyncedCustomTypes } = useUnSyncChanges();
  const numberOfChanges = unSyncedSlices.length + unSyncedCustomTypes.length;

  if (
    !isOnline ||
    authStatus === AuthStatus.UNAUTHORIZED ||
    authStatus === AuthStatus.FORBIDDEN
  ) {
    return null;
  }

  if (numberOfChanges === 0) {
    return null;
  }

  const formattedNumberOfChanges = numberOfChanges > 9 ? "+9" : numberOfChanges;

  return (
    <Box padding={{ inline: 6 }} borderRadius={10} backgroundColor="grey5">
      <Text color="grey11" variant="small">
        {formattedNumberOfChanges}
      </Text>
    </Box>
  );
};

// TODO(DT-1925): Reactivate this feature
const useOpenChangesHoverCard = () => {
  // const { hasSeenChangesToolTip, hasSeenSimulatorToolTip } = useSelector(
  //   (store: SliceMachineStoreType) => ({
  //     hasSeenChangesToolTip: userHasSeenChangesToolTip(store),
  //     hasSeenSimulatorToolTip: userHasSeenSimulatorToolTip(store),
  //   }),
  // );

  // return (
  //   !hasSeenChangesToolTip &&
  //   hasSeenSimulatorToolTip
  // );

  return false;
};
