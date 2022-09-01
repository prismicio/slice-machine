import React from "react";
import useWindowSize from "src/hooks/useWindowSize";

import Desktop from "./Menu/Desktop";
import Mobile from "./Menu/Mobile";
import { IconType } from "react-icons/lib";
import { MdHorizontalSplit, MdLoop, MdSpaceDashboard } from "react-icons/md";
import { ChangesIndicator } from "./Menu/Navigation/ChangesIndicator";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getUnSyncedSlices } from "@src/modules/slices";
import { getUnSyncedCustomTypes } from "@src/modules/availableCustomTypes";
import { useNetwork } from "@src/hooks/useNetwork";
import { useUnSyncChanges } from "@src/hooks/useUnSyncChanges";

export interface LinkProps {
  title: string;
  href: string;
  match: (pathname: string) => boolean;
  Icon: IconType;
  delimiter?: boolean;
  target?: "_blank";
  RightElement?: React.ReactNode;
}

const getNavigationLinks = (
  displayNumberOfChanges: boolean,
  numberOfChanges: number
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

  const { unSyncedSlices, unSyncedCustomTypes } = useUnSyncChanges();

  const numberOfChanges = unSyncedSlices.length + unSyncedCustomTypes.length;
  const displayNumberOfChanges = numberOfChanges !== 0 && isOnline;

  return (viewport.width as number) < 640 ? (
    <Mobile
      links={getNavigationLinks(displayNumberOfChanges, numberOfChanges)}
    />
  ) : (
    <Desktop
      links={getNavigationLinks(displayNumberOfChanges, numberOfChanges)}
    />
  );
};

export default Navigation;
