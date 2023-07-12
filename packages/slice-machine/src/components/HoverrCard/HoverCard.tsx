import React from "react";
import * as RadixHoverCard from "@radix-ui/react-hover-card";

import * as styles from "./HovevrCard.css";

export const HoverCard: React.FC<
  React.PropsWithChildren<
    {
      anchor: React.ReactNode;
    } & RadixHoverCard.HoverCardProps
  >
> = ({ anchor, children, ...rest }) => (
  <RadixHoverCard.Root {...rest}>
    <RadixHoverCard.Trigger asChild>{anchor}</RadixHoverCard.Trigger>
    <RadixHoverCard.Portal>
      <RadixHoverCard.Content className={styles.container}>
        {children}
        <RadixHoverCard.Arrow className={styles.arrow} />
      </RadixHoverCard.Content>
    </RadixHoverCard.Portal>
  </RadixHoverCard.Root>
);
