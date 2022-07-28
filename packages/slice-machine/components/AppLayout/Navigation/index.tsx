import React from "react";
import useWindowSize from "src/hooks/useWindowSize";

import Desktop from "./Menu/Desktop";
import Mobile from "./Menu/Mobile";
import { IconType } from "react-icons/lib";
import { MdHorizontalSplit, MdLoop, MdSpaceDashboard } from "react-icons/md";

export interface LinkProps {
  title: string;
  href: string;
  match: (pathname: string) => boolean;
  Icon: IconType;
  delimiter?: boolean;
  target?: "_blank";
  numberOfChanges?: number;
}

const links: LinkProps[] = [
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
    numberOfChanges: 5,
  },
];

const Navigation: React.FC = () => {
  const viewport = useWindowSize();
  return (viewport.width as number) < 640 ? (
    <Mobile links={links} />
  ) : (
    <Desktop links={links} />
  );
};

export default Navigation;
