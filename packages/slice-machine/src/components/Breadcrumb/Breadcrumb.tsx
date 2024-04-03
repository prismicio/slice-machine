import { Text } from "@prismicio/editor-ui";
import clsx from "clsx";
import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useMemo,
} from "react";

import styles from "./Breadcrumb.module.css";

type BreadcrumbContext = {
  separator?: ReactNode;
};

const BreadcrumbContext = createContext<BreadcrumbContext>({});

type BreadcrumbProps = PropsWithChildren<{
  separator?: ReactNode;
}>;

export function Breadcrumb(props: BreadcrumbProps) {
  const { separator = "/", children, ...restProps } = props;
  const contextValue = useMemo(() => ({ separator }), [separator]);

  return (
    <nav aria-label="Breadcrumb" {...restProps}>
      <ol className={styles.items}>
        <BreadcrumbContext.Provider value={contextValue}>
          {children}
        </BreadcrumbContext.Provider>
      </ol>
    </nav>
  );
}

type BreadcrumbItemProps = PropsWithChildren<{
  active?: boolean;
}>;

export function BreadcrumbItem(props: BreadcrumbItemProps) {
  const { active = false, children, ...otherProps } = props;
  const { separator } = useContext(BreadcrumbContext);

  return (
    <li {...otherProps} className={styles.item}>
      <Text
        component="span"
        color={active ? "grey12" : "grey11"}
        className={clsx(active && styles.active)}
      >
        {children}
      </Text>
      <div role="presentation" className={styles.separator}>
        <Text component="span" color="grey11">
          {separator}
        </Text>
      </div>
    </li>
  );
}
