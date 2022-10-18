import React from "react";

import { Button as ThemeUIButton, Spinner } from "theme-ui";
import { ThemeUIStyleObject } from "@theme-ui/css";
import { IconType } from "react-icons";

export type ButtonProps = {
  label: string;
  Icon?: IconType;
  type?: "submit" | "reset" | "button";
  form?: string;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  sx?: ThemeUIStyleObject;
  "data-cy"?: string;
  variant?: string;
};

// Small helper to allow us to target spinner and icon in the CY
const cyIdBuilder = (dataCy: string | undefined, id: string) => {
  if (dataCy) return `${dataCy}-${id}`;
  return "";
};

const spinnerColor = (variant: string) => {
  switch (variant) {
    case "white":
      return "#1A1523";
    default:
      return "grey01";
  }
};

// If you don't use an icon, don't forget to pass a min-width property so the button doesn't change width on loading.
export const Button: React.FunctionComponent<ButtonProps> = ({
  label,
  Icon,
  type,
  form,
  isLoading = false,
  disabled = false,
  onClick,
  sx = {},
  variant = "primary",
  ...rest
}) => (
  <ThemeUIButton
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
    disabled={disabled}
    onClick={!isLoading ? onClick : undefined}
    variant={variant}
    {...rest}
  >
    {isLoading ? (
      <>
        <Spinner
          size={16}
          color={spinnerColor(variant)}
          data-cy={cyIdBuilder(rest["data-cy"], "spinner")}
        />
        {Icon && label}
      </>
    ) : (
      <>
        {Icon && (
          <Icon size={16} data-cy={cyIdBuilder(rest["data-cy"], "icon")} />
        )}
        {label}
      </>
    )}
  </ThemeUIButton>
);
