import useWindowSize from "hooks/useWindowSize";
import Environment from "../../../lib/models/common/Environment";
import Desktop from "./Menu/Desktop";
import Mobile from "./Menu/Mobile";
import { FiFile } from "react-icons/fi";
import { FiBox } from "react-icons/fi";

const links = [
  {
    title: "Custom Types",
    href: "/",
    Icon: FiFile,
  },
  {
    title: "Slices",
    href: "/slices",
    Icon: FiBox,
  },
];

const Navigation = ({ env }: { env: Environment }) => {
  const viewport = useWindowSize();
  return (viewport.width as number) < 640 ? (
    <Mobile links={links} env={env} />
  ) : (
    <Desktop links={links} env={env} />
  );
};

export default Navigation;
