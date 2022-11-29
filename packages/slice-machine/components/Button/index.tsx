import React, { forwardRef } from "react";

import { Button as ThemeUIButton, ButtonProps, Spinner } from "theme-ui";
import { IconType } from "react-icons";

export interface SmButtonProps extends ButtonProps {
  label: string;
  Icon?: IconType;
  isLoading?: boolean;
  "data-cy"?: string;
}

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
  )
);
