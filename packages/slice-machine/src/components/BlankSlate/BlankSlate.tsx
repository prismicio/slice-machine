import { Text } from "@prismicio/editor-ui";
import { clsx } from "clsx";
import type { CSSProperties, FC, PropsWithChildren } from "react";

import styles from "./BlankSlate.module.css";

interface BlankSlateProps extends PropsWithChildren {
  style?: CSSProperties;
  backgroundImage?: string;
}

export const BlankSlate: FC<BlankSlateProps> = ({
  backgroundImage,
  style,
  ...props
}) => {
  const hasBackground = backgroundImage !== undefined;
  return (
    <article
      {...props}
      className={clsx(styles.root, {
        [styles.withBackground]: hasBackground,
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
  <Text {...props} variant="h3" />
);

export const BlankSlateDescription: FC<PropsWithChildren> = (props) => (
  <Text {...props} color="grey11" />
);

export const BlankSlateActions: FC<PropsWithChildren> = (props) => (
  <div {...props} className={styles.actions} color="grey" />
);
