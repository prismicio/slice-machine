import { Text } from "@prismicio/editor-ui";
import clsx from "clsx";
import { Children, FC, PropsWithChildren } from "react";

import styles from "./Breadcrumb.module.css";

export const Breadcrumb: FC<PropsWithChildren> = (props) => {
  const { children, ...otherProps } = props;
  const childrenCount = Children.count(children);

  return (
    <nav aria-label="Breadcrumb" {...otherProps}>
      <ol className={styles.items}>
        {Children.map(children, (child, index) => (
          <>
            {child}
            {index < childrenCount - 1 ? <BreadcrumbSeparator /> : null}
          </>
        ))}
      </ol>
    </nav>
  );
};

type BreadcrumbItemProps = PropsWithChildren<{
  active?: boolean;
}>;

export const BreadcrumbItem: FC<BreadcrumbItemProps> = (props) => {
  const { active = false, children, ...otherProps } = props;

  return (
    <li {...otherProps}>
      <Text
        component="span"
        color={active ? "grey12" : "grey11"}
        className={clsx(active && styles.active)}
      >
        {children}
      </Text>
    </li>
  );
};

const BreadcrumbSeparator: FC = () => {
  return (
    <li aria-hidden={true}>
      <Text component="span" color="grey11">
        /
      </Text>
    </li>
  );
};
