import { type FC } from "react";
import { useRouter } from "next/router";
import { Box, Button, Icon, Text } from "@prismicio/editor-ui";

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
import { useActiveEnvironment } from "@src/features/environments/useActiveEnvironment";

export const ChangesItem: FC = () => {
  const { setSeenChangesToolTip } = useSliceMachineActions();
  const open = useOpenChangesHoverCard();
  const router = useRouter();
  const { activeEnvironment } = useActiveEnvironment();
  const isDevEnvironment = activeEnvironment?.kind === "dev";

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
        <Button
          color="grey"
          disabled={isDevEnvironment}
          sx={{ marginBottom: 16 }}
          onClick={() => {
            void router.push("/changes");
          }}
        >
          <Box alignItems="center" gap={4}>
            {isDevEnvironment ? (
              <>
                <Icon name="refresh" size="medium" color="grey11" />
                <Text>Auto-sync activated</Text>
              </>
            ) : (
              <>
                <Text>Review changes</Text> <ChangesCount />
              </>
            )}
          </Box>
        </Button>
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
