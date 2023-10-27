import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { ComponentProps, FC, PropsWithChildren } from "react";
import {
  Box,
  DropdownMenuContent,
  DropdownMenuItem,
  Text,
} from "@prismicio/editor-ui";

import * as styles from "./DropdownMenuGroup.css";

export const DropdownMenuGroupLabel: FC<PropsWithChildren> = ({ children }) => {
  return (
    <DropdownMenuPrimitive.Label className={styles.label}>
      <Text color="grey9" component="span">
        {children}
      </Text>
    </DropdownMenuPrimitive.Label>
  );
};

type DropdownMenuGroupItemProps = ComponentProps<typeof DropdownMenuItem>;

export const DropdownMenuGroupItem: FC<DropdownMenuGroupItemProps> = (
  props,
) => {
  return (
    <DropdownMenuItem
      {...props}
      // TODO: How do I fix this? - Angelo
      // @ts-expect-error - `style` is not a `<DropdownMenuItem>` prop.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      style={{ borderRadius: 4, height: 40, ...props.style }}
    />
  );
};

type DropdownMenuGroupContentProps = ComponentProps<typeof DropdownMenuContent>;

export const DropdownMenuGroupContent: FC<DropdownMenuGroupContentProps> = (
  props,
) => {
  const { children, ...otherProps } = props;

  return (
    <DropdownMenuContent {...otherProps}>
      <Box flexDirection="column" padding={8}>
        {children}
      </Box>
    </DropdownMenuContent>
  );
};
