import React, { forwardRef } from "react";
import { Flex, ThemeUIStyleObject } from "theme-ui";

interface LiProps {
  children: React.ReactNode;
  sx: ThemeUIStyleObject;
  Component: typeof Flex;
}

const Li = forwardRef(
  (
    { children, Component = Flex, sx = {}, ...rest }: LiProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => (
    <Component
      as="li"
      sx={{
        p: 3,
        mx: 3,
        alignItems: "center",
        variant: "styles.listItem",
        ...sx,
      }}
      ref={ref}
      {...rest}
    >
      {children}
    </Component>
  )
);

export default Li;
