import clsx from "clsx";
import { ButtonGroup, Text } from "@prismicio/editor-ui";
import type { CSSProperties, FC, PropsWithChildren } from "react";

import * as styles from "./BlankSlate.css";

interface BlankSlateProps extends PropsWithChildren {
  style?: CSSProperties;
  backgroundImage?: string;
  variation?: "spacious";
}

export const BlankSlate: FC<BlankSlateProps> = ({
  backgroundImage,
  style,
  variation,
  ...props
}) => {
  const hasBackground = backgroundImage !== undefined;
  const large = hasBackground && variation !== "spacious";
  const spacious = variation === "spacious";
  return (
    <article
      {...props}
      className={clsx(styles.root, {
        [styles.withBackground]: hasBackground,
        [styles.large]: large,
        [styles.spacious]: spacious,
      })}
      style={{
        backgroundImage: hasBackground ? `url(${backgroundImage})` : undefined,
        ...style,
      }}
    />
  );
};

export const BlankSlateImage: FC<PropsWithChildren> = (props) => (
  <div {...props} className={styles.image} />
);

export const BlankSlateContent: FC<PropsWithChildren> = (props) => (
  <div {...props} className={styles.content} />
);

export const BlankSlateTitle: FC<PropsWithChildren> = (props) => (
  <Text {...props} className={styles.title} />
);

export const BlankSlateDescription: FC<PropsWithChildren> = (props) => (
  <Text {...props} className={styles.desc} color="grey11" />
);

export const BlankSlateActions: FC<PropsWithChildren> = (props) => (
  <ButtonGroup
    {...props}
    className={styles.actions}
    size="medium"
    variant="secondary"
  />
);
