import { type FC } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import { SideNavLink, SideNavListItem } from "@src/components/SideNav";
import { RadarIcon } from "@src/icons/RadarIcon";
import {
  HoverCard,
  HoverCardCloseButton,
  HoverCardDescription,
  HoverCardMedia,
  HoverCardTitle,
} from "@src/components/HoverCard";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

import { ChangesRightElement } from "./ChangesRightElement";

export const ChangesListItem: FC = () => {
  const { setSeenChangesToolTip } = useSliceMachineActions();
  const open = useOpenChangesHoverCard();
  const router = useRouter();

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
        <SideNavListItem>
          <SideNavLink
            title="Changes"
            href="/changes"
            active={router.asPath.startsWith("/changes")}
            component={Link}
            Icon={RadarIcon}
            RightElement={<ChangesRightElement />}
          />
        </SideNavListItem>
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
