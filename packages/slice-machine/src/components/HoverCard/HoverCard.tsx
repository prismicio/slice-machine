import React from "react";
import * as RadixHoverCard from "@radix-ui/react-hover-card";

import * as styles from "./HoverCard.css";

export type HoverCardProps = React.PropsWithChildren<
  {
    anchor: React.ReactNode;
    side?: RadixHoverCard.HoverCardContentProps["side"];
    sideOffset?: RadixHoverCard.HoverCardContentProps["sideOffset"];
  } & RadixHoverCard.HoverCardProps
>;

export const HoverCard: React.FC<HoverCardProps> = ({
  anchor,
  children,
  side,
  sideOffset,
  ...rest
}) => (
  <RadixHoverCard.Root {...rest}>
    <RadixHoverCard.Trigger asChild>{anchor}</RadixHoverCard.Trigger>
    <RadixHoverCard.Portal>
      <RadixHoverCard.Content
        className={styles.container}
        side={side}
        sideOffset={sideOffset}
      >
        {children}
        <RadixHoverCard.Arrow className={styles.arrow} width={12} height={6} />
      </RadixHoverCard.Content>
    </RadixHoverCard.Portal>
  </RadixHoverCard.Root>
);
