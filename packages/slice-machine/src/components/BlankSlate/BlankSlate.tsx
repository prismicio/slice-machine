import { ButtonGroup, Text } from "@prismicio/editor-ui";
import type { CSSProperties, FC, PropsWithChildren } from "react";

import * as styles from "./BlankSlate.css";

interface BlankSlateProps extends PropsWithChildren {
  style?: CSSProperties;
}

export const BlankSlate: FC<BlankSlateProps> = (props) => (
  <article {...props} className={styles.root} />
);

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
    size="large"
    variant="secondary"
  />
);
