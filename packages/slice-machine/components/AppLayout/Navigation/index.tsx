import React from "react";
import useWindowSize from "src/hooks/useWindowSize";

import Desktop from "./Menu/Desktop";
import Mobile from "./Menu/Mobile";
import { IconType } from "react-icons/lib";
import { MdHorizontalSplit, MdLoop, MdSpaceDashboard } from "react-icons/md";
import { ChangesIndicator } from "./Menu/Navigation/ChangesIndicator";
import { useNetwork } from "@src/hooks/useNetwork";
import { useUnSyncChanges } from "@src/hooks/useUnSyncChanges";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";

export interface LinkProps {
  title: string;
  href: string;
  match: (pathname: string) => boolean;
  Icon: IconType;
  IconStyle?: React.CSSProperties;
  delimiter?: boolean;
  target?: "_blank";
  RightElement?: React.ReactNode;
}

const getNavigationLinks = (
  displayNumberOfChanges: boolean,
  numberOfChanges: number,
  isPushingChanges: boolean
): LinkProps[] => [
  {
    title: "Custom Types",
    href: "/",
    match(pathname: string) {
      return pathname === "/" || pathname.indexOf("/cts") === 0;
    },
    Icon: MdSpaceDashboard,
  },
  {
    title: "Slices",
    href: "/slices",
    match(pathname: string) {
      return pathname.indexOf("/slices") === 0;
    },
    Icon: MdHorizontalSplit,
  },
  {
    title: "Changes",
    href: "/changes",
    match(pathname: string) {
      return pathname.indexOf("/changes") === 0;
    },
    Icon: MdLoop,
    IconStyle: isPushingChanges
      ? { animation: "spin 1.5s infinite linear" }
      : {},
    RightElement: displayNumberOfChanges ? (
      <ChangesIndicator
        numberOfChanges={numberOfChanges}
        match={(pathname: string) => pathname.indexOf("/changes") === 0}
      />
    ) : null,
  },
];

const Navigation: React.FC = () => {
  const viewport = useWindowSize();
  const isOnline = useNetwork();

  const { isPushingChanges } = useSelector((store: SliceMachineStoreType) => ({
    isPushingChanges: isLoading(store, LoadingKeysEnum.CHANGES_PUSH),
  }));

  const { unSyncedSlices, unSyncedCustomTypes } = useUnSyncChanges();

  const numberOfChanges = unSyncedSlices.length + unSyncedCustomTypes.length;
  const displayNumberOfChanges = numberOfChanges !== 0 && isOnline;

  return (viewport.width as number) < 640 ? (
    <Mobile
      links={getNavigationLinks(
        displayNumberOfChanges,
        numberOfChanges,
        isPushingChanges
      )}
    />
  ) : (
    <Desktop
      links={getNavigationLinks(
        displayNumberOfChanges,
        numberOfChanges,
        isPushingChanges
      )}
    />
  );
};

export default Navigation;
