import React from "react";

import { Button as ThemeUIButton, Spinner } from "theme-ui";
import { ThemeUIStyleObject } from "@theme-ui/css";

export type SliceMachineButtonProps = {
  isLoading?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  sx: ThemeUIStyleObject;
};

const Button: React.FunctionComponent<SliceMachineButtonProps> = ({
  isLoading = false,
  children,
  onClick,
  sx,
}) => {
  return (
    <ThemeUIButton
      sx={{
        alignSelf: "flex-start",
        ...sx,
      }}
      onClick={onClick}
    >
      {isLoading ? <Spinner color="#F7F7F7" size={14} mr={2} /> : children}
    </ThemeUIButton>
  );
};

export default Button;
