import React from "react";

import { Button, Spinner } from "theme-ui";
import { ThemeUIStyleObject } from "@theme-ui/css";

export type SliceMachineButtonProps = {
  isLoading?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  sx: ThemeUIStyleObject;
};

const SliceMachineButton: React.FunctionComponent<SliceMachineButtonProps> = ({
  isLoading = false,
  children,
  onClick,
  sx,
}) => {
  return (
    <Button
      sx={{
        alignSelf: "flex-start",
        ...sx,
      }}
      onClick={onClick}
    >
      {isLoading ? <Spinner color="#F7F7F7" size={14} mr={2} /> : children}
    </Button>
  );
};

export default SliceMachineButton;
