import { Flex, Input, Label, ThemeUIStyleObject } from "theme-ui";

export enum ScreenSizeOptions {
  DESKTOP = "Desktop",
  TABLET = "Tablet",
  MOBILE = "Mobile",
  CUSTOM = "Custom",
}

export const ScreenSizes: Record<string, { width: number; height: number }> = {
  [ScreenSizeOptions.DESKTOP]: {
    width: 1200,
    height: 800,
  },
  [ScreenSizeOptions.TABLET]: {
    width: 1024,
    height: 800,
  },
  [ScreenSizeOptions.MOBILE]: {
    width: 400,
    height: 850,
  },
};

type ScreensizeInputProps = {
  label: "H" | "W";
  startValue: number;
  onChange: (sizeEvent: React.ChangeEvent<HTMLInputElement>) => void;
  isActive: boolean;
  sx?: ThemeUIStyleObject;
};

export const ScreensizeInput: React.FC<ScreensizeInputProps> = ({
  label,
  startValue,
  onChange,
  isActive,
  sx,
}) => {
  return (
    <Flex
      sx={{
        alignItems: "center",
        ...sx,
      }}
    >
      <Label
        sx={{
          backgroundColor: "grey07",
          border: "transparent",
          borderRight: "1px solid #DCDBDD",
          borderRadius: "6px 0px 0px 6px",
          width: 26,
          height: 30,
          color: "greyIcon",
          fontWeight: "bold",
          fontSize: "14px",
          alignItems: "center",
          justifyContent: "center",
          "&:hover": { cursor: isActive ? "default" : "not-allowed" },
          position: "absolute",
          ml: "1px",
        }}
        htmlFor={`${label}-screensize-input`}
      >
        {label}
      </Label>
      <Input
        type="number"
        name={`${label}-screensize-input`}
        disabled={!isActive}
        sx={{
          width: 80,
          height: 32,
          p: 0,
          border: "1px solid #E4E2E4",
          borderRadius: "6px",
          "&::-webkit-outer-spin-button,&::-webkit-inner-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
          },
          "&:hover": { cursor: isActive ? "default" : "not-allowed" },
          color: "greyIcon",
          backgroundColor: isActive ? "white" : "grey07",
          textAlign: "center",
          paddingLeft: 26,
        }}
        onChange={onChange}
        value={startValue}
      />
    </Flex>
  );
};
