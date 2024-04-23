import { ScreenDimensions } from "@lib/models/common/Screenshots";
import { Flex, Input, Label, ThemeUIStyleObject } from "theme-ui";

export enum ScreenSizeOptions {
  DESKTOP = "Desktop",
  TABLET = "Tablet",
  MOBILE = "Mobile",
  CUSTOM = "Custom",
}

export const ScreenSizes: Record<string, ScreenDimensions> = {
  [ScreenSizeOptions.DESKTOP]: {
    width: 1280,
    height: 800,
  },
  [ScreenSizeOptions.TABLET]: {
    width: 1080,
    height: 810,
  },
  [ScreenSizeOptions.MOBILE]: {
    width: 390,
    height: 844,
  },
};

type ScreensizeInputProps = {
  label: "H" | "W";
  startValue: string;
  onChange: (sizeEvent: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: ThemeUIStyleObject;
  disabled: boolean;
};

export const ScreensizeInput: React.FC<ScreensizeInputProps> = ({
  label,
  startValue,
  onChange,
  sx,
  disabled,
}) => {
  const disabledCharacters = ["e", "-", "+", ",", "."];

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
          borderRight: (t) => `1px solid ${String(t.colors?.darkBorder)}`,
          borderRadius: "6px 0px 0px 6px",
          width: 26,
          height: 30,
          color: "greyIcon",
          fontWeight: "bold",
          fontSize: "14px",
          alignItems: "center",
          justifyContent: "center",
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
        disabled={disabled}
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
          color: "greyIcon",
          textAlign: "center",
          paddingLeft: 26,
          "&:disabled": {
            cursor: "not-allowed",
            "&:hover": {
              border: "1px solid #E4E2E4",
            },
            "&:active": {
              border: "1px solid #E4E2E4",
              boxShadow: "none",
            },
          },
        }}
        onChange={onChange}
        value={startValue}
        min="0"
        onKeyDown={(event) => {
          if (disabledCharacters.includes(event.key)) {
            event.preventDefault();
          }
        }}
      />
    </Flex>
  );
};
