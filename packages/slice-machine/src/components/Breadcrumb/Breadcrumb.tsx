import { Text } from "@prismicio/editor-ui";
import { PropsWithChildren, ReactNode } from "react";

import styles from "./Breadcrumb.module.css";

type BreadcrumbProps = PropsWithChildren<{
  activeItem?: ReactNode;
}>;

export function Breadcrumb(props: BreadcrumbProps) {
  const { activeItem, children, ...restProps } = props;

  return (
    <div aria-label="Breadcrumb" {...restProps} className={styles.breadcrumb}>
      <Text component="span" color="grey11">
        {children}
      </Text>
      {Boolean(activeItem) ? (
        <Text
          component="span"
          color="grey12"
          className={styles.activeItemContainer}
        >
          {activeItem}
        </Text>
      ) : null}
    </div>
  );
}

export function BreadcrumbItem(props: PropsWithChildren) {
  return <span {...props} className={styles.item} />;
}
