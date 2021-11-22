import useWindowSize from "../../../hooks/useWindowSize";

import Desktop from "./Menu/Desktop";
import Mobile from "./Menu/Mobile";
import { FiLayers, FiLayout } from "react-icons/fi";
import { IconType } from "react-icons/lib";

const links = [
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

export interface LinkProps {
  title: string;
  delimiter?: boolean;
  href: string;
  match: Function;
  Icon: IconType;
}

const Navigation: React.FunctionComponent = () => {
  const viewport = useWindowSize();
  return (viewport.width as number) < 640 ? (
    <Mobile links={links} />
  ) : (
    <Desktop links={links} />
  );
};

export default Navigation;
