import { MouseEventHandler, forwardRef, useState } from "react";
import { useRouter } from "next/router";
import { SliceMachineStoreType } from "@src/redux/type";
import { useSelector } from "react-redux";

import { SideNavLink, SideNavListItem } from "@src/components/SideNav";
import { RadarIcon } from "@src/icons/RadarIcon";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import {
  HoverCard,
  HoverCardCloseButton,
  HoverCardDescription,
  HoverCardMedia,
  HoverCardTitle,
} from "@src/components/HoverCard";
import { userHasSeenChangesToolTip } from "@src/modules/userContext";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { ChangesRightElement } from "./ChangesRightElement";

type ChangesListItemProps = {
  handleNavigation: MouseEventHandler<HTMLAnchorElement>;
};

export const ChangesListItem = forwardRef<HTMLLIElement, ChangesListItemProps>(
  ({ handleNavigation }, ref) => {
    const { setSeenChangesToolTip } = useSliceMachineActions();
    const open = useOpenChangesHoverCard();
    const router = useRouter();
    const currentPath = router.asPath;

    const onClose = () => {
      setSeenChangesToolTip();
    };

    return (
      <HoverCard
        open={open}
        openDelay={1500}
        onClose={onClose}
        side="right"
        sideOffset={24}
        collisionPadding={280}
        trigger={
          <SideNavListItem ref={ref}>
            <SideNavLink
              title="Changes"
              href="/changes"
              active={currentPath.startsWith("/changes")}
              onClick={handleNavigation}
              Icon={RadarIcon}
              RightElement={<ChangesRightElement />}
            />
          </SideNavListItem>
        }
      >
        <HoverCardTitle>Push your changes</HoverCardTitle>
        <HoverCardMedia component="image" src="/push.png" />
        <HoverCardDescription>
          When you click Save, your changes are saved locally. Then, you can
          push your models to Prismic from the Changes page.
        </HoverCardDescription>
        <HoverCardCloseButton>Got It</HoverCardCloseButton>
      </HoverCard>
    );
  }
);

const useOpenChangesHoverCard = () => {
  const { hasSeenChangesToolTip, isSavingCustomType, isSavingSlice } =
    useSelector((store: SliceMachineStoreType) => ({
      hasSeenChangesToolTip: userHasSeenChangesToolTip(store),
      isSavingCustomType: isLoading(store, LoadingKeysEnum.SAVE_CUSTOM_TYPE),
      isSavingSlice: isLoading(store, LoadingKeysEnum.SAVE_SLICE),
    }));

  const isSaving = isSavingCustomType || isSavingSlice;
  const [prevIsSaving, setPrevIsSaving] = useState(isSaving);

  if (!prevIsSaving && isSaving) {
    setPrevIsSaving(isSaving);
  }

  return !hasSeenChangesToolTip && !isSaving && prevIsSaving;
};
