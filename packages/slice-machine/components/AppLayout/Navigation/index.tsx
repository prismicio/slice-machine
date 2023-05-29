import React from "react";
import useWindowSize from "src/hooks/useWindowSize";

import Desktop from "./Menu/Desktop";
import Mobile from "./Menu/Mobile";
import { IconType } from "react-icons/lib";
import { ChangesIndicator } from "./Menu/Navigation/ChangesIndicator";
import { useNetwork } from "@src/hooks/useNetwork";
import { useUnSyncChanges } from "@src/hooks/useUnSyncChanges";
import { DatabaseIcon } from "@src/components/Icons/DatabaseIcon";
import { SliceListIcon } from "@src/components/Icons/SliceListIcon";
import { RadarIcon } from "@src/components/Icons/RadarIcon";
import { PageStackIcon } from "@src/components/Icons/PageStackIcon";
import { CUSTOM_TYPES_CONFIG } from "@src/features/customTypes/customTypesConfig";

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
    title: CUSTOM_TYPES_CONFIG["page"].title,
    href: "/",
    match(pathname: string) {
      return (
        pathname === "/" ||
        pathname.indexOf(`/${CUSTOM_TYPES_CONFIG["page"].urlPathSegment}`) === 0
      );
    },
    Icon: () => <PageStackIcon />,
  },
  {
    title: CUSTOM_TYPES_CONFIG["custom"].title,
    href: `/${CUSTOM_TYPES_CONFIG["custom"].urlPathSegment}`,
    match(pathname: string) {
      return (
        pathname.indexOf(`/${CUSTOM_TYPES_CONFIG["custom"].urlPathSegment}`) ===
        0
      );
    },
    Icon: () => <DatabaseIcon />,
  },
  {
    title: "Slices",
    href: "/slices",
    match(pathname: string) {
      return pathname.indexOf("/slices") === 0;
    },
    Icon: () => <SliceListIcon />,
  },
  {
    title: "Changes",
    href: "/changes",
    match(pathname: string) {
      return pathname.indexOf("/changes") === 0;
    },
    Icon: () => <RadarIcon />,
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
