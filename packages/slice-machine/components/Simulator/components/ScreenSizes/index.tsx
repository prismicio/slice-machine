import { Button, Flex } from "theme-ui";
import { FiSmartphone } from "react-icons/fi";
import { MdComputer } from "react-icons/md";
import { FaTabletAlt } from "react-icons/fa";

import { darken } from "@theme-ui/color";

export enum Size {
  FULL = "FULL",
  TABLET = "TABLET",
  PHONE = "PHONE",
}

const screens = [
  {
    Icon: <MdComputer size={20} />,
    size: Size.FULL,
  },
  {
    Icon: <FaTabletAlt size={20} />,
    size: Size.TABLET,
  },
  {
    Icon: <FiSmartphone size={20} />,
    size: Size.PHONE,
  },
];

export const iframeSizes = {
  [Size.FULL]: {
    width: "100%",
    height: "calc(100vh - 70px)",
  },
  [Size.TABLET]: {
    width: "50%",
    minWidth: "340px",
    pt: 4,
    height: "calc(600px)",
  },
  [Size.PHONE]: {
    width: "340px",
    pt: 4,
    height: "calc(600px)",
  },
};

// eslint-disable-next-line @typescript-eslint/ban-types
const ScreenSizes = ({ size, onClick }: { size: Size; onClick: Function }) => {
  return (
    <Flex>
      {screens.map((screen, i) => (
        <Button
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          onClick={() => onClick(screen)}
          key={screen.size}
          variant="buttons.screenSize"
          sx={{
            mr: screens[i + 1] ? 2 : 0,
            ...(size !== screen.size
              ? {
                  color: "text",
                  bg: "secondary",
                }
              : null),
            "&:hover": {
              ...(size === screen.size
                ? {
                    color: "white",
                    bg: "text",
                  }
                : {
                    color: "text",
                    bg: darken("secondary", 0.05),
                  }),
            },
          }}
        >
          {screen.Icon}
        </Button>
      ))}
    </Flex>
  );
};

export default ScreenSizes;
