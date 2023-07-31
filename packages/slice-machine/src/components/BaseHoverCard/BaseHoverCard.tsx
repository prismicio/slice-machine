import { FC, useMemo, type PropsWithChildren, type ReactNode } from "react";
import * as RadixHoverCard from "@radix-ui/react-hover-card";

import * as styles from "./BaseHoverCard.css";

export type BaseHoverCardProps = PropsWithChildren<
  {
    align?: RadixHoverCard.HoverCardContentProps["align"];
    alignOffset?: RadixHoverCard.HoverCardContentProps["alignOffset"];
    arrowSize?: number;
    collisionPadding?: RadixHoverCard.HoverCardContentProps["collisionPadding"];
    side?: RadixHoverCard.HoverCardContentProps["side"];
    sideOffset?: RadixHoverCard.HoverCardContentProps["sideOffset"];
    trigger: ReactNode;
  } & RadixHoverCard.HoverCardProps
>;

export const BaseHoverCard: FC<BaseHoverCardProps> = ({
  align,
  alignOffset,
  arrowSize = 12,
  children,
  collisionPadding,
  side,
  sideOffset = 4,
  trigger,
  ...rest
}) => {
  const { arrowWidth, arrowHeight } = useMemo(() => {
    if (arrowSize === undefined)
      return {
        arrowWidth: 10,
        arrowHeight: 5,
      };

    const arrowWidth = Math.SQRT2 * arrowSize;
    const arrowHeight = arrowWidth / 2;

    return { arrowWidth, arrowHeight };
  }, [arrowSize]);

  return (
    <RadixHoverCard.Root {...rest}>
      <RadixHoverCard.Trigger asChild>{trigger}</RadixHoverCard.Trigger>
      <RadixHoverCard.Portal>
        <RadixHoverCard.Content
          align={align}
          alignOffset={alignOffset}
          className={styles.container}
          collisionPadding={collisionPadding}
          side={side}
          sideOffset={sideOffset}
        >
          {children}
          <RadixHoverCard.Arrow
            className={styles.arrow}
            height={arrowHeight}
            width={arrowWidth}
          />
        </RadixHoverCard.Content>
      </RadixHoverCard.Portal>
    </RadixHoverCard.Root>
  );
};
