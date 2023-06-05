import type { CSSProperties, FC, PropsWithChildren } from "react";
import { ButtonGroup } from "@prismicio/editor-ui";
import { Text } from "@prismicio/editor-ui";

import * as styles from "./BlankSlate.css";

export interface BlankSlateProps extends PropsWithChildren {
  style?: CSSProperties;
}

export const BlankSlate: FC<BlankSlateProps> = ({ children, ...props }) => (
  <article {...props} className={styles.root}>
    <div className={styles.centeredBlock}>{children}</div>
  </article>
);

export const BlankSlateImage: FC<PropsWithChildren> = (props) => (
  <div {...props} className={styles.image} />
);

export const BlankSlateContent: FC<PropsWithChildren> = (props) => (
  <div {...props} className={styles.content}>
    {props.children}
  </div>
);

export const BlankSlateTitle: FC<PropsWithChildren> = (props) => (
  <Text {...props} className={styles.title} />
);

export const BlankSlateDescription: FC<PropsWithChildren> = (props) => (
  <Text {...props} color="grey11" className={styles.desc} />
);

export const BlankSlateActions: FC<PropsWithChildren> = (props) => (
  <ButtonGroup
    {...props}
    className={styles.actions}
    size="large"
    variant="secondary"
  />
);
