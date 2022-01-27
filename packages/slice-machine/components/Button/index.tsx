import React from "react";

import { Button as ThemeUIButton, Spinner } from "theme-ui";
import { ThemeUIStyleObject } from "@theme-ui/css";

export type SliceMachineButtonProps = {
  form?: string;
  type?: "submit" | "reset" | "button";
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  sx?: ThemeUIStyleObject;
};

const Button: React.FunctionComponent<SliceMachineButtonProps> = ({
  isLoading = false,
  children,
  onClick,
  form,
  type,
  disabled,
  sx = {},
}) => {
  return (
    <ThemeUIButton
      sx={{
        alignSelf: "flex-start",
        ...sx,
      }}
      form={form}
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {isLoading ? <Spinner color="#F7F7F7" size={14} mr={2} /> : children}
    </ThemeUIButton>
  );
};

export default Button;
