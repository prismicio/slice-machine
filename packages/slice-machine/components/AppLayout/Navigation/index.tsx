import React from "react";
import useWindowSize from "src/hooks/useWindowSize";

import Desktop from "./Menu/Desktop";
import Mobile from "./Menu/Mobile";
import { FiLayers, FiLayout } from "react-icons/fi";
import { IconType } from "react-icons/lib";

export interface LinkProps {
  title: string;
  href: string;
  match: (pathname: string) => boolean;
  Icon: IconType;
  delimiter?: boolean;
  target?: "_blank";
}

const links: LinkProps[] = [
  {
    title: "Custom Types",
    href: "/",
    match(pathname: string) {
      return pathname === "/" || pathname.indexOf("/cts") === 0;
    },
    Icon: FiLayout,
  },
  {
    title: "Slices",
    href: "/slices",
    match(pathname: string) {
      return pathname.indexOf("/slices") === 0;
    },
    Icon: FiLayers,
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
