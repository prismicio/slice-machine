import { createContext } from "react";
import useWindowSize from "hooks/useWindowSize";
import Environment from "lib/models/common/Environment";
import Desktop from "./Menu/Desktop";
import Mobile from "./Menu/Mobile";
import { FiLayers, FiLayout } from "react-icons/fi";
import { IconType } from "react-icons/lib";

const links = [
  {
    title: "Custom Types",
    href: "/",
    match(pathname: string) {
      return pathname === '/' || pathname.indexOf('/cts') === 0
    },
    Icon: FiLayout,
  },
  {
    title: "Slices",
    href: "/slices",
    match(pathname: string) {
      return pathname.indexOf('/slices') === 0
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

export interface NavCtxProps {
  links: LinkProps[];
  env: Environment;
}

export const NavCtx = createContext<NavCtxProps | null>(null);

const Navigation = ({ env }: { env: Environment }) => {
  const viewport = useWindowSize();
  return (
    <NavCtx.Provider value={{ links, env }}>
      {(viewport.width as number) < 640 ? <Mobile /> : <Desktop />}
    </NavCtx.Provider>
  );
};

export default Navigation;
