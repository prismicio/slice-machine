import { Button } from "theme-ui";

export enum Size {
  FULL = "FULL",
  TABLET = "TABLET",
  PHONE = "PHONE",
}

const screens = [
  {
    Icon: <span>A</span>,
    size: Size.FULL,
  },
  {
    Icon: <span>B</span>,
    size: Size.TABLET,
  },
  {
    Icon: <span>C</span>,
    size: Size.PHONE,
  },
];

export const iframeSizes = {
  [Size.FULL]: {
    width: "100vw",
    height: "calc(100vh - 70px)",
  },
  [Size.TABLET]: {
    width: "50vw",
    mt: 4,
    border: "2px solid #111",
    height: "calc(600px)",
  },
  [Size.PHONE]: {
    width: "340px",
    mt: 4,
    border: "2px solid #111",
    height: "calc(600px)",
  },
};

const ScreenSizes = ({ size, onClick }: { size: Size; onClick: Function }) => {
  return (
    <div>
      {screens.map((screen, i) => (
        <Button
          onClick={() => onClick(screen)}
          key={screen.size}
          sx={{
            bg: size === screen.size ? "black" : "initial",
            mr: screens[i + 1] ? 2 : 0,
            color: size === screen.size ? "white" : "#111",
          }}
        >
          {screen.Icon}
        </Button>
      ))}
    </div>
  );
};

export default ScreenSizes;
