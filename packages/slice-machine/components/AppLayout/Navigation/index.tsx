import { type FC, type ReactNode, createElement } from "react";
import useWindowSize from "src/hooks/useWindowSize";

import Desktop from "./Menu/Desktop";
import Mobile from "./Menu/Mobile";
import { IconType } from "react-icons/lib";
import { ChangesIndicator } from "./Menu/Navigation/ChangesIndicator";
import { useNetwork } from "@src/hooks/useNetwork";
import { useUnSyncChanges } from "@src/hooks/useUnSyncChanges";
import { SliceListIcon } from "@src/icons/SliceListIcon";
import { RadarIcon } from "@src/icons/RadarIcon";
import { CUSTOM_TYPES_CONFIG } from "@src/features/customTypes/customTypesConfig";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";

export interface LinkProps {
  title: string;
  href: string;
  match: (pathname: string) => boolean;
  Icon: IconType;
  delimiter?: boolean;
  target?: "_blank";
  RightElement?: ReactNode;
}

const getNavigationLinks = (
  displayNumberOfChanges: boolean,
  numberOfChanges: number
): LinkProps[] => [
  {
    title: CUSTOM_TYPES_MESSAGES["page"].name({ start: true, plural: true }),
    href: CUSTOM_TYPES_CONFIG["page"].tablePagePathname,
    match: (pathname: string) =>
      CUSTOM_TYPES_CONFIG["page"].matchesTablePagePathname(pathname),
    Icon: () => createElement(CUSTOM_TYPES_CONFIG["page"].Icon),
  },
  {
    title: CUSTOM_TYPES_MESSAGES["custom"].name({ start: true, plural: true }),
    href: CUSTOM_TYPES_CONFIG["custom"].tablePagePathname,
    match: (pathname: string) =>
      CUSTOM_TYPES_CONFIG["custom"].matchesTablePagePathname(pathname),
    Icon: () => createElement(CUSTOM_TYPES_CONFIG["custom"].Icon),
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

const Navigation: FC = () => {
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
