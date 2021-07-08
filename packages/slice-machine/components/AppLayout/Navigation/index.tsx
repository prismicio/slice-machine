import { createContext } from "react";
import useWindowSize from "../../../hooks/useWindowSize";
import Environment from "../../../lib/models/common/Environment"
import Warning from '../../../lib/models/common/Warning'

import Desktop from "./Menu/Desktop";
import Mobile from "./Menu/Mobile";
import { FiLayers, FiLayout } from "react-icons/fi";
import { IconType } from "react-icons/lib";
import { ConfigErrors } from "../../../lib/models/server/ServerState";

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
  warnings: ReadonlyArray<Warning>,
  configErrors: ConfigErrors
}

export const NavCtx = createContext<NavCtxProps | null>(null);

const Navigation = ({ env, warnings, configErrors }: { env: Environment, warnings: ReadonlyArray<Warning>, configErrors: ConfigErrors }) => {
  const viewport = useWindowSize();
  return (
    <NavCtx.Provider value={{ links, env, warnings, configErrors }}>
      {(viewport.width as number) < 640 ? <Mobile /> : <Desktop />}
    </NavCtx.Provider>
  );
};

export default Navigation;
