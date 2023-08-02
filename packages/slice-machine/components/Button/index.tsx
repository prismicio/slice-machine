import { forwardRef } from "react";

import { Button as ThemeUIButton, ButtonProps, Spinner } from "theme-ui";
import { IconType } from "react-icons";

export interface SmButtonProps extends ButtonProps {
  label: string;
  Icon?: IconType;
  isLoading?: boolean;
  "data-cy"?: string;
  iconSize?: number;
  iconFill?: string;
}

// Small helper to allow us to target spinner and icon in the CY
const cyIdBuilder = (dataCy: string | undefined, id: string) => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (dataCy) return `${dataCy}-${id}`;
  return "";
};

const spinnerColor = (variant: string) => {
  switch (variant) {
    case "white":
    case "secondaryMedium":
    case "secondarySmall":
    case "secondary":
      return "#1A1523";
    default:
      return "grey01";
  }
};

// If you don't use an icon, don't forget to pass a min-width property so the button doesn't change width on loading.
export const Button = forwardRef<HTMLButtonElement, SmButtonProps>(
  (
    {
      label,
      Icon,
      type,
      form,
      isLoading = false,
      disabled = false,
      onClick,
      sx = {},
      iconSize = 16,
      iconFill,
      variant = "primary",
      ...rest
    },
    ref
  ) => (
    <ThemeUIButton
      ref={ref}
      sx={{
        ...sx,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        ...(isLoading ? { cursor: "wait !important" } : {}), // without important, the hover effect has priority
      }}
      type={type}
      form={form}
      disabled={disabled || isLoading}
      onClick={!isLoading ? onClick : undefined}
      variant={variant}
      {...rest}
    >
      {isLoading ? (
        <>
          <Spinner
            size={iconSize}
            color={spinnerColor(variant)}
            data-cy={cyIdBuilder(rest["data-cy"], "spinner")}
          />
          {Icon && label}
        </>
      ) : (
        <>
          {Icon && (
            <Icon
              size={iconSize}
              fill={iconFill}
              data-cy={cyIdBuilder(rest["data-cy"], "icon")}
            />
          )}
          {label}
        </>
      )}
    </ThemeUIButton>
  )
);
